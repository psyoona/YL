using Microsoft.AspNetCore.Mvc;
using YL.Models.Dtos.Apis;

namespace YL.Controllers.Apis
{
	[ApiController]
	public class TeamsController : BaseApiController
	{
		private ILogger Logger { get; }

		public TeamsController(IConfiguration configuration, ILogger<KakaoUserRequest> logger) : base(configuration)
		{
			this.Logger = logger;
		}

		[HttpGet]
		[Route("GetTeamsMessage")]
		public JsonResult GetTeamsMessage()
		{
			return this.Json(new { test = "zxcvb" });
		}
	}
}
