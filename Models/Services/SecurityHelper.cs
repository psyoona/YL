using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.DataProtection.KeyManagement;

namespace YL.Models.Services
{
	public class SecurityHelper
	{
		public SecurityHelper(string encryptKey)
		{
			if (string.IsNullOrEmpty(encryptKey))
			{
				this.EncryptKey = "nfactor!planemo!nfactor!planemo!";
			}
			else
			{
				this.EncryptKey = encryptKey;
			}
		}

		public string EncryptKey { get; set; }

		public string EncryptAes256(string plainText)
		{
			try
			{
				RijndaelManaged aes = new RijndaelManaged();
				aes.KeySize = 256;
				aes.BlockSize = 128;
				aes.Mode = CipherMode.CBC;
				aes.Padding = PaddingMode.PKCS7;
				aes.Key = Encoding.UTF8.GetBytes(this.EncryptKey);
				aes.IV = Encoding.UTF8.GetBytes(this.EncryptKey.Substring(0, 16));

				ICryptoTransform encrypt = aes.CreateEncryptor(aes.Key, aes.IV);
				byte[] byteArray = null;

				using (MemoryStream memoryStream = new MemoryStream())
				{
					using (CryptoStream cryptoStream = new CryptoStream(memoryStream, encrypt, CryptoStreamMode.Write))
					{
						byte[] xXml = Encoding.UTF8.GetBytes(plainText);
						cryptoStream.Write(xXml, 0, xXml.Length);
					}

					byteArray = memoryStream.ToArray();
				}

				return Convert.ToBase64String(byteArray);
			}
			catch
			{
				return "암호화에 실패했습니다.";
			}
		}

		public string DecryptAes256(string encryptedText)
		{
			try
			{
				RijndaelManaged aes = new RijndaelManaged();
				aes.KeySize = 256;
				aes.BlockSize = 128;
				aes.Mode = CipherMode.CBC;
				aes.Padding = PaddingMode.PKCS7;
				aes.Key = Encoding.UTF8.GetBytes(this.EncryptKey);
				aes.IV = Encoding.UTF8.GetBytes(this.EncryptKey.Substring(0, 16));

				ICryptoTransform decrypt = aes.CreateDecryptor();
				byte[] byteArray = null;
				using (MemoryStream memoryStream = new MemoryStream())
				{
					using (CryptoStream cryptoStream = new CryptoStream(memoryStream, decrypt, CryptoStreamMode.Write))
					{
						byte[] xXml = Convert.FromBase64String(encryptedText);
						cryptoStream.Write(xXml, 0, xXml.Length);
					}

					byteArray = memoryStream.ToArray();
				}

				return Encoding.UTF8.GetString(byteArray);
			}
			catch
			{
				return "복호화에 실패했습니다.";
			}
		}
	}
}
