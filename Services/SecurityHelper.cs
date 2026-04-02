using System.Security.Cryptography;
using System.Text;

namespace YL.Services
{
	public class SecurityHelper
	{
		public SecurityHelper() { }

		public string EncryptAes256(string plainText, string encryptKey)
		{
			using Aes aes = Aes.Create();
			aes.KeySize = 256;
			aes.BlockSize = 128;
			aes.Mode = CipherMode.CBC;
			aes.Padding = PaddingMode.PKCS7;
			aes.Key = Encoding.UTF8.GetBytes(encryptKey);
			aes.IV = Encoding.UTF8.GetBytes(encryptKey.Substring(0, 16));

			ICryptoTransform encrypt = aes.CreateEncryptor(aes.Key, aes.IV);

			using MemoryStream memoryStream = new MemoryStream();
			using (CryptoStream cryptoStream = new CryptoStream(memoryStream, encrypt, CryptoStreamMode.Write))
			{
				byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);
				cryptoStream.Write(plainBytes, 0, plainBytes.Length);
				cryptoStream.FlushFinalBlock();
			}

			return Convert.ToBase64String(memoryStream.ToArray());
		}

		public string DecryptAes256(string encryptedText, string encryptKey)
		{
			using Aes aes = Aes.Create();
			aes.KeySize = 256;
			aes.BlockSize = 128;
			aes.Mode = CipherMode.CBC;
			aes.Padding = PaddingMode.PKCS7;
			aes.Key = Encoding.UTF8.GetBytes(encryptKey);
			aes.IV = Encoding.UTF8.GetBytes(encryptKey.Substring(0, 16));

			ICryptoTransform decrypt = aes.CreateDecryptor();

			using MemoryStream memoryStream = new MemoryStream();
			using (CryptoStream cryptoStream = new CryptoStream(memoryStream, decrypt, CryptoStreamMode.Write))
			{
				byte[] encryptedBytes = Convert.FromBase64String(encryptedText);
				cryptoStream.Write(encryptedBytes, 0, encryptedBytes.Length);
				cryptoStream.FlushFinalBlock();
			}

			return Encoding.UTF8.GetString(memoryStream.ToArray());
		}

		public string Sha512Hash(string plainText)
		{
			UTF8Encoding utfEncoding = new UTF8Encoding();
			byte[] hashValue;
			byte[] byteValue = utfEncoding.GetBytes(plainText);

			SHA512 sha512 = SHA512.Create();
			string hex = string.Empty;
			hashValue = sha512.ComputeHash(byteValue);

			foreach (byte x in hashValue)
			{
				hex += $"{x:x2}";
			}

			return hex;
		}
	}
}
