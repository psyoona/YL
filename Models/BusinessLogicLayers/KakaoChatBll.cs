using YL.Models.Daos;
using YL.Models.Services;

namespace YL.Models.BusinessLogicLayers
{
	public class KakaoChatBll
	{
		public KakaoChatBll() { }

		public string ParsingMessage(string message)
		{
			string apiKey = new ChatGptDao().GetChatGptApiKey();
			string result = string.Empty;

			if (message.Equals("안녕"))
			{
				result = "안녕하세요.";
			}
			else if (message.Equals("운세"))
			{
				result = new FortuneDao().GetFortuneMessage();
			}
			else
			{
				result = "ChatGpt의 응답입니다.\n";
				result += new ChatGptService(apiKey).SendMessageGpt(message);
			}

			return result;
		}
	}
}
