#!/usr/bin/env python3
import os
import logging
from dotenv import load_dotenv
from sources import NewsFetcher
from summarizer import NewsDigestSummarizer
from telegram import TelegramNotifier

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('news_agent.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def main():
    # Load environment variables from .env file
    load_dotenv()

    # Get API keys and credentials
    groq_api_key = os.getenv('GROQ_API_KEY')
    telegram_bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    telegram_channel = os.getenv('TELEGRAM_CHANNEL', 'neuro_andrew')

    if not groq_api_key:
        logger.error("GROQ_API_KEY not found in environment variables")
        return False

    if not telegram_bot_token:
        logger.error("TELEGRAM_BOT_TOKEN not found in environment variables")
        return False

    logger.info("Starting AI News Digest Agent...")

    # Step 1: Fetch news from all sources
    logger.info("Step 1: Fetching news from sources...")
    fetcher = NewsFetcher()
    all_news = fetcher.fetch_all()
    logger.info(f"Total news items fetched: {len(all_news)}")

    # Step 2: Get top unique news
    logger.info("Step 2: Selecting top 10 unique news...")
    top_news = fetcher.get_top_news(count=10)
    logger.info(f"Top news selected: {len(top_news)}")

    if not top_news:
        logger.warning("No news items found to digest")
        return False

    # Step 3: Create digest with summaries
    logger.info("Step 3: Creating digest with summaries...")
    summarizer = NewsDigestSummarizer(groq_api_key)
    digest = summarizer.create_digest(top_news)

    logger.info(f"Digest created ({len(digest)} chars)")

    # Step 4: Send to Telegram
    logger.info("Step 4: Sending digest to Telegram...")
    notifier = TelegramNotifier(telegram_bot_token, telegram_channel)
    success = notifier.send_digest(digest)

    if success:
        logger.info("✅ AI News Digest successfully sent to Telegram!")
        return True
    else:
        logger.error("❌ Failed to send digest to Telegram")
        return False

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        exit(1)
