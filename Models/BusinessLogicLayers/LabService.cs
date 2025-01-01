using System.Security.Cryptography.Xml;
using YL.Models.Daos;
using YL.Models.Dtos.Webs;
using YL.Models.Services;

namespace YL.Models.BusinessLogicLayers
{
	public class LabService
	{
		public LabService() { }

		public string EncryptString(string plainText, int encryptType, string encryptKey)
		{
			string result = string.Empty;

			if (encryptType == 1)
			{
				result = new SecurityHelper(encryptKey).EncryptAes256(plainText);
			}
			else if(encryptType == 2) 
			{
				result = new SecurityHelper().Sha512Hash(plainText);
			}

			return result;
		}

		public string DecryptString(string encryptedText, int encryptType, string encryptKey)
		{
			string result = string.Empty;

			if (encryptType == 1)
			{
				result = new SecurityHelper(encryptKey).DecryptAes256(encryptedText);
			}

			return result;
		}

		public string RequestChatGpt(string usingType, string usingKey, string message)
		{
			string apiKey = new ChatGptDao().GetChatGptApiKey(usingKey);

			if (usingType.Equals("1"))
			{
				message = $"'{message}'를 영어로 번역해줘";
			}
			else if (usingType.Equals("2"))
			{
				message = $"'{message}'를 한국어로 번역해줘";
			}

			string response = new ChatGptService(apiKey).SendMessageGpt(message);
			new ChatGptDao().InsertChatGptUsingLog(usingType, message, response);

			return response;
		}

		public AccountMainData GetAccountMainData()
		{
			return new AccountDao().GetAccountMainData();
		}

		public string GetAccountHistory()
		{
			new AccountDao().GetAccountHistory();

			return string.Empty;
		}
	}
}
