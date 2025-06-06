﻿using Microsoft.AspNetCore.Mvc;
using YL.Functions;

namespace YL.Controllers.Apis
{
	[ApiController]
	public class CommonApiController : BaseApiController
	{
		public CommonApiController() { }

		[HttpGet]
		[Route("Version")]
		public JsonResult Version()
		{
			return this.Json(new { VERSION = VersionHelper.GetApplicationVersion() }, this.JsonSerializerOptions);
		}
	}
}
