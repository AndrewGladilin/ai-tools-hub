import feedparser
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

class NewsItem:
    def __init__(self, title: str, url: str, source: str, summary: str = "", published: str = ""):
        self.title = title
        self.url = url
        self.source = source
        self.summary = summary
        self.published = published

    def __repr__(self):
        return f"{self.source}: {self.title[:60]}... | {self.url}"

class NewsFetcher:
    def __init__(self):
        self.timeout = 10
        self.news_items: List[NewsItem] = []

    def fetch_all(self) -> List[NewsItem]:
        """Fetch news from all sources"""
        sources = [
            self.fetch_habr,
            self.fetch_hackernews,
            self.fetch_arxiv,
            self.fetch_reddit,
            self.fetch_product_hunt,
            self.fetch_techcrunch,
            self.fetch_medium,
            self.fetch_the_verge,
            self.fetch_lobsters,
        ]

        for fetcher in sources:
            try:
                logger.info(f"Fetching from {fetcher.__name__}...")
                items = fetcher()
                self.news_items.extend(items)
                logger.info(f"Got {len(items)} items from {fetcher.__name__}")
            except Exception as e:
                logger.error(f"Error fetching from {fetcher.__name__}: {e}")

        return self.news_items

    def fetch_habr(self) -> List[NewsItem]:
        """Fetch from Habr RSS (AI/ML tags)"""
        items = []
        url = "https://habr.com/ru/feed/news/?fl=ru%2Cen"
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:5]:
                # Filter by AI/ML related keywords
                title_lower = entry.title.lower()
                keywords = ['ai', 'нейросеть', 'ml', 'машинное обучение', 'neural', 'llm', 'gpt', 'claude', 'gemini']
                if any(kw in title_lower for kw in keywords):
                    items.append(NewsItem(
                        title=entry.title,
                        url=entry.link,
                        source="📰 Habr",
                        published=entry.get('published', '')
                    ))
        except Exception as e:
            logger.error(f"Habr error: {e}")
        return items

    def fetch_hackernews(self) -> List[NewsItem]:
        """Fetch from HackerNews RSS"""
        items = []
        url = "https://news.ycombinator.com/rss"
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:8]:
                title_lower = entry.title.lower()
                keywords = ['ai', 'ml', 'neural', 'llm', 'gpt', 'machine learning', 'deep learning']
                if any(kw in title_lower for kw in keywords):
                    items.append(NewsItem(
                        title=entry.title,
                        url=entry.link,
                        source="🔗 HackerNews",
                        published=entry.get('published', '')
                    ))
        except Exception as e:
            logger.error(f"HackerNews error: {e}")
        return items

    def fetch_arxiv(self) -> List[NewsItem]:
        """Fetch from ArXiv (AI papers)"""
        items = []
        url = "http://arxiv.org/rss/cs.AI"
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:3]:
                items.append(NewsItem(
                    title=entry.title,
                    url=entry.link,
                    source="📚 ArXiv",
                    published=entry.get('published', '')
                ))
        except Exception as e:
            logger.error(f"ArXiv error: {e}")
        return items

    def fetch_reddit(self) -> List[NewsItem]:
        """Fetch from Reddit (r/MachineLearning, r/LanguageModels)"""
        items = []
        subreddits = ['MachineLearning', 'LanguageModels', 'artificial']

        for subreddit in subreddits:
            try:
                url = f"https://www.reddit.com/r/{subreddit}/new.rss?sort=new"
                feed = feedparser.parse(url)
                for entry in feed.entries[:3]:
                    items.append(NewsItem(
                        title=entry.title,
                        url=entry.link,
                        source=f"🔴 Reddit r/{subreddit}",
                        published=entry.get('published', '')
                    ))
            except Exception as e:
                logger.error(f"Reddit {subreddit} error: {e}")

        return items

    def fetch_product_hunt(self) -> List[NewsItem]:
        """Fetch from Product Hunt RSS"""
        items = []
        url = "https://www.producthunt.com/feed.xml"
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:5]:
                title_lower = entry.title.lower()
                keywords = ['ai', 'ml', 'gpt', 'neural']
                if any(kw in title_lower for kw in keywords):
                    items.append(NewsItem(
                        title=entry.title,
                        url=entry.link,
                        source="🚀 Product Hunt",
                        published=entry.get('published', '')
                    ))
        except Exception as e:
            logger.error(f"Product Hunt error: {e}")
        return items

    def fetch_techcrunch(self) -> List[NewsItem]:
        """Fetch from TechCrunch RSS"""
        items = []
        url = "https://techcrunch.com/feed/"
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:6]:
                title_lower = entry.title.lower()
                keywords = ['ai', 'artificial intelligence', 'machine learning', 'gpt', 'openai', 'anthropic']
                if any(kw in title_lower for kw in keywords):
                    items.append(NewsItem(
                        title=entry.title,
                        url=entry.link,
                        source="💻 TechCrunch",
                        published=entry.get('published', '')
                    ))
        except Exception as e:
            logger.error(f"TechCrunch error: {e}")
        return items

    def fetch_medium(self) -> List[NewsItem]:
        """Fetch from Medium AI publications"""
        items = []
        url = "https://medium.com/feed/tag/artificial-intelligence"
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:4]:
                items.append(NewsItem(
                    title=entry.title,
                    url=entry.link,
                    source="✍️ Medium",
                    published=entry.get('published', '')
                ))
        except Exception as e:
            logger.error(f"Medium error: {e}")
        return items

    def fetch_the_verge(self) -> List[NewsItem]:
        """Fetch from The Verge RSS"""
        items = []
        url = "https://www.theverge.com/ai-artificial-intelligence/index.xml"
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:4]:
                items.append(NewsItem(
                    title=entry.title,
                    url=entry.link,
                    source="📱 The Verge",
                    published=entry.get('published', '')
                ))
        except Exception as e:
            logger.error(f"The Verge error: {e}")
        return items

    def fetch_lobsters(self) -> List[NewsItem]:
        """Fetch from Lobsters (tech community)"""
        items = []
        url = "https://lobste.rs/t/ai.rss"
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:3]:
                items.append(NewsItem(
                    title=entry.title,
                    url=entry.link,
                    source="🦞 Lobsters",
                    published=entry.get('published', '')
                ))
        except Exception as e:
            logger.error(f"Lobsters error: {e}")
        return items

    def deduplicate(self) -> List[NewsItem]:
        """Remove duplicate articles by title similarity"""
        seen = {}
        unique_items = []

        for item in self.news_items:
            # Simple deduplication by domain
            domain = item.url.split('/')[2]
            key = (domain, item.title[:50])

            if key not in seen:
                seen[key] = True
                unique_items.append(item)

        return unique_items

    def get_top_news(self, count: int = 10) -> List[NewsItem]:
        """Get top N unique news items"""
        unique = self.deduplicate()
        # Sort by source diversity and recency
        return unique[:count]
