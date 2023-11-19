using YL.Models.Services;

namespace YL.Models.BusinessLogicLayers
{
	public class LaboratoryBll
	{
		public LaboratoryBll() { }

		public string EncryptString(string plainText, string encryptType, string encryptKey)
		{
			string result = string.Empty;

			if (encryptType.ToLower().Equals("aes256"))
			{
				result = new SecurityHelper(encryptKey).EncryptAes256(plainText);
			}

			return result;
		}
	}
}
