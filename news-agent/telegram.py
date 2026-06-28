import requests
import logging

logger = logging.getLogger(__name__)

class TelegramNotifier:
    def __init__(self, bot_token: str, channel_username: str):
        self.bot_token = bot_token
        self.channel_username = channel_username
        self.api_url = f"https://api.telegram.org/bot{bot_token}"

    def send_message(self, text: str) -> bool:
        """Send message to Telegram channel"""
        try:
            url = f"{self.api_url}/sendMessage"
            payload = {
                "chat_id": f"@{self.channel_username}",
                "text": text,
                "parse_mode": "Markdown",
                "disable_web_page_preview": False
            }

            response = requests.post(url, json=payload, timeout=10)

            if response.status_code == 200:
                logger.info(f"Message sent to @{self.channel_username}")
                return True
            else:
                logger.error(f"Telegram API error: {response.status_code} - {response.text}")
                return False

        except Exception as e:
            logger.error(f"Error sending Telegram message: {e}")
            return False

    def send_digest(self, digest_text: str) -> bool:
        """Send news digest to channel"""
        # Split into multiple messages if too long (Telegram limit is 4096 chars)
        max_length = 4000
        messages = []

        if len(digest_text) > max_length:
            parts = digest_text.split('\n\n')
            current_message = ""

            for part in parts:
                if len(current_message) + len(part) + 2 > max_length:
                    if current_message:
                        messages.append(current_message)
                    current_message = part
                else:
                    current_message += "\n\n" + part if current_message else part

            if current_message:
                messages.append(current_message)
        else:
            messages = [digest_text]

        success = True
        for msg in messages:
            if not self.send_message(msg):
                success = False

        return success
