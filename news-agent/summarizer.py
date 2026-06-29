from groq import Groq
from typing import List
import logging

logger = logging.getLogger(__name__)

class NewsDigestSummarizer:
    def __init__(self, groq_api_key: str):
        self.client = Groq(api_key=groq_api_key)
        self.model = "llama-3.1-8b-instant"

    def translate_and_summarize(self, title: str, url: str) -> tuple:
        """Translate title to Russian and generate summary"""
        try:
            message = self.client.chat.completions.create(
                model=self.model,
                max_tokens=150,
                messages=[
                    {
                        "role": "user",
                        "content": f"""Выполни два задания:
1. Переведи этот заголовок на русский язык
2. Напиши короткую суммаризацию (до 15 слов) на русском

Заголовок: {title}

Ответ в формате:
ЗАГОЛОВОК: <русский перевод заголовка>
СУММАРИЗАЦИЯ: <краткое резюме>"""
                    }
                ]
            )
            response = message.choices[0].message.content.strip()

            # Parse response
            lines = response.split('\n')
            ru_title = title
            summary = "..."

            for line in lines:
                if 'ЗАГОЛОВОК:' in line:
                    ru_title = line.replace('ЗАГОЛОВОК:', '').strip()
                elif 'СУММАРИЗАЦИЯ:' in line:
                    summary = line.replace('СУММАРИЗАЦИЯ:', '').strip()

            return ru_title, summary
        except Exception as e:
            logger.error(f"Error translating and summarizing: {e}")
            return title, "..."

    def create_digest(self, news_items: List) -> str:
        """Create formatted digest from news items in Russian"""
        from datetime import datetime

        months_ru = {
            'January': 'января', 'February': 'февраля', 'March': 'марта',
            'April': 'апреля', 'May': 'мая', 'June': 'июня',
            'July': 'июля', 'August': 'августа', 'September': 'сентября',
            'October': 'октября', 'November': 'ноября', 'December': 'декабря'
        }

        today_en = datetime.now().strftime("%d %B %Y")
        day, month_en, year = today_en.split()
        month_ru = months_ru.get(month_en, month_en)
        today_ru = f"{day} {month_ru} {year}"

        digest = "🔥 *ДАЙДЖЕСТ НОВОСТЕЙ ПО ИИ*\n"
        digest += f"📅 {today_ru}\n\n"

        for idx, item in enumerate(news_items, 1):
            # Translate title and get summary
            ru_title, summary = self.translate_and_summarize(item.title, item.url)

            digest += f"{idx}️⃣ {item.source}\n"
            digest += f"📌 *{ru_title}*\n"
            digest += f"💬 _{summary}_\n"
            digest += f"🔗 [{item.url.split('/')[2]}]({item.url})\n\n"

        digest += "─" * 40 + "\n"
        digest += "🤖 *Ежедневный дайджест от ИИ-агента*\n"
        digest += "📢 [Подпишись на канал](https://t.me/neuro_andrew)"

        return digest
