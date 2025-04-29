# Expense Tracker Bot

A simple Discord bot to track your expenses and log them to a Google Sheet.  
Expenses are saved with category, amount (in ₹), and the current date.

## Features

- Add expenses via Discord DM using a simple command.
- Expenses are automatically appended to a Google Sheet.
- Amounts are recorded in Indian Rupees (₹).
- Date is auto-filled (no need to enter manually).

## Usage

**Command format:**

```
!add expense: <category>, <amount>
```

**Example:**

```
!add expense: Food, 250
```

The bot will reply:

```
Expense saved: Food, ₹250, 2025-04-29
```

## Setup

1. **Clone the repository:**

   ```sh
   git clone <repo-url>
   cd expense-tracker-bot
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Google Sheets API Setup:**

   - Create a Google Cloud project and enable the Sheets API.
   - Create a Service Account and download the `credentials.json` file.
   - Place `credentials.json` in the project root (same level as `src`).

4. **Share your Google Sheet:**

   - Create a Google Sheet.
   - Share it with your service account email (found in `credentials.json`).

5. **Configure environment variables:**

   - Copy `.env.example` to `.env` (or create `.env`).
   - Add your Discord bot token and Google Sheet ID:
     ```
     DISCORD_TOKEN=your_discord_token
     SHEET_ID=your_google_sheet_id
     ```

6. **Run the bot:**
   - For development:
     ```sh
     npm run dev
     ```
   - For production:
     ```sh
     npm run build
     npm start
     ```

## Notes

- Only works in Discord DMs.
- Make sure `credentials.json` and `.env` are **not** committed to version control.
- The bot ignores messages from other bots and non-DM channels.

## License

MIT
