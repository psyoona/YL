using System.Reflection;

namespace YL.Models.Functions
{
	public class VersionHelper
	{
		public static string GetApplicationVersion()
		{
			Version version = Assembly.GetExecutingAssembly().GetName().Version;

			return $"{version.Major}.{version.Minor:D2}.{version.Build:D3}";
		}
	}
}
