from groq import Groq
from typing import List
import logging

logger = logging.getLogger(__name__)

class NewsDigestSummarizer:
    def __init__(self, groq_api_key: str):
        self.client = Groq(api_key=groq_api_key)
        self.model = "llama3-8b-8192"

    def summarize_article(self, title: str, url: str) -> str:
        """Generate a one-line summary for an article using Groq"""
        try:
            message = self.client.chat.completions.create(
                model=self.model,
                max_tokens=100,
                messages=[
                    {
                        "role": "user",
                        "content": f"""Напиши короткую (до 15 слов) суммаризацию этой новости на русском:
Заголовок: {title}
URL: {url}

Ответ только суммаризацию, без лишних слов."""
                    }
                ]
            )
            return message.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Error summarizing article: {e}")
            return "..."

    def create_digest(self, news_items: List) -> str:
        """Create formatted digest from news items"""
        from datetime import datetime

        today = datetime.now().strftime("%d %B %Y").replace(" 0", " ")
        digest = f"🔥 **AI & ML NEWS DIGEST**\n"
        digest += f"📅 {today}\n\n"

        for idx, item in enumerate(news_items, 1):
            # Get summary for each article
            summary = self.summarize_article(item.title, item.url)

            digest += f"{idx}️⃣ {item.source}\n"
            digest += f"📌 *{item.title}*\n"
            digest += f"💬 _{summary}_\n"
            digest += f"🔗 [{item.url.split('/')[2]}]({item.url})\n\n"

        digest += "---\n"
        digest += "🤖 Сводка подготовлена ИИ-агентом\n"
        digest += "[Подпишись на канал](/neuro_andrew) для ежедневных обновлений"

        return digest
