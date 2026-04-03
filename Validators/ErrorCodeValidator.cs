using System.Reflection;
using System.Text.Json;
using YL.Models.Dtos.Commons;

namespace YL.Validators
{
	public static class ErrorCodeValidator
	{
		public static void Validate(string webRootPath)
		{
			var errorCodes = typeof(AlbumErrors)
				.GetFields(BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy)
				.Where(f => f.IsLiteral && f.FieldType == typeof(int))
				.Select(f => (int)f.GetRawConstantValue()!)
				.ToList();

			string localesPath = Path.Combine(webRootPath, "locales");
			string[] localeFiles = Directory.GetFiles(localesPath, "*.json");

			foreach (string filePath in localeFiles)
			{
				string fileName = Path.GetFileName(filePath);
				string json = File.ReadAllText(filePath);
				var messages = JsonSerializer.Deserialize<Dictionary<string, string>>(json);
				var keys = messages?.Keys.ToHashSet() ?? new HashSet<string>();

				var missingCodes = errorCodes
					.Where(code => !keys.Contains(code.ToString()))
					.ToList();

				if (missingCodes.Count > 0)
				{
					throw new Exception(
						$"[ErrorCodeValidator] {fileName}에 누락된 에러 코드: {string.Join(", ", missingCodes)}");
				}
			}
		}
	}
}
