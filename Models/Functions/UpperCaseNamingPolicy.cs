using System.Text.Json;

namespace YL.Models.Functions
{
	public class UpperCaseNamingPolicy : JsonNamingPolicy
	{
		public override string ConvertName(string name) => name.ToUpper();
	}
}
