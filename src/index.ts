import { Client, IntentsBitField, Message, ChannelType, Partials } from 'discord.js';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import * as dotenv from 'dotenv';

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CREDENTIALS_PATH = __dirname + '/../credentials.json';
const SHEET_ID = process.env.SHEET_ID || '';
const PREFIX = '!';

// Google Sheets append function
async function appendExpenseToSheet(
  sheetId: string,
  category: string,
  amount: number,
  date: string
): Promise<void> {
  try {
    const auth = new JWT({
      keyFile: CREDENTIALS_PATH,
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const range = 'Sheet1!A:C';
    const values = [[category, amount, date]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values },
    });
    console.log('Expense appended to sheet:', { category, amount, date });
  } catch (error) {
    console.error('Error appending to Google Sheet:', error);
    throw new Error('Failed to save expense');
  }
}

// Function to get total amount spent
async function getTotalAmount(sheetId: string): Promise<number> {
  try {
    const auth = new JWT({
      keyFile: CREDENTIALS_PATH,
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const range = 'Sheet1!B:B'; // Amounts are in column B

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });

    const rows = res.data.values || [];
    // Skip header if present, and sum all numeric values
    const total = rows
      .flat()
      .map((v) => parseFloat(v))
      .filter((n) => !isNaN(n))
      .reduce((sum, n) => sum + n, 0);

    return total;
  } catch (error) {
    console.error('Error fetching total amount:', error);
    return 0;
  }
}

// Discord bot setup
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.on('messageCreate', async (message: Message) => {
  // Ignore messages from bots or non-DM channels
  if (message.author.bot || message.channel.type !== ChannelType.DM) return;

  const content = message.content.trim();

  // Check if the message starts with the command prefix
  if (!content.startsWith(PREFIX)) {
    await message.reply('Please use the format: `!add expense: <category>, <amount>, <date>`');
    return;
  }

  const command = content.slice(PREFIX.length).trim();
  if (command.startsWith('add expense:')) {
    try {
      const expenseDetails = command.slice('add expense:'.length).trim();
      const [category, amountStr] = expenseDetails.split(',').map((s) => s.trim());

      // Validate inputs
      if (!category || !amountStr) {
        await message.reply('Invalid format. Use: `!add expense: <category>, <amount>`');
        return;
      }

      const amount = parseFloat(amountStr);
      if (isNaN(amount) || amount <= 0) {
        await message.reply('Please provide a valid amount.');
        return;
      }

      // Get current date in YYYY-MM-DD format
      const now = new Date();
      const date = now.toISOString().slice(0, 10);

      // Append to Google Sheet
      await appendExpenseToSheet(SHEET_ID, category, amount, date);

      const total = await getTotalAmount(SHEET_ID);
      await message.reply(`Expense saved: ${category}, ₹${amount}, ${date}\nTotal spent: ₹${total}`);
    } catch (error) {
      console.error('Error processing expense:', error);
      await message.reply('Failed to save expense. Please try again later.');
    }
  } else {
    await message.reply('Unknown command. Use `!add expense: <category>, <amount>`');
  }
});

client.login(process.env.DISCORD_TOKEN);