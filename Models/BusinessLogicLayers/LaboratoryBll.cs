using YL.Models.Services;

namespace YL.Models.BusinessLogicLayers
{
	public class LaboratoryBll
	{
		public LaboratoryBll() { }

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
	}
}
