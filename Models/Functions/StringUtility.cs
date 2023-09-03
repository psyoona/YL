using System.Text.RegularExpressions;

namespace YL.Models.Functions
{
	internal class StringUtility
	{
		public static string ConvertSnakeCase(string text)
		{
			return Regex.Replace(text, "[A-Z]", "_$0").Remove(0, 1);
		}

		public static string ConvertCamelCase(string text)
		{
			string[] words = text.Split(new[] { "_", " " }, StringSplitOptions.RemoveEmptyEntries);

			string[] tailWords = words.Select(word => char.ToUpper(word[0]) + word.Substring(1).ToLower()).ToArray();

			return $"{string.Join(string.Empty, tailWords)}";
		}
	}
}
