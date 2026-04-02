using Microsoft.AspNetCore.Mvc.Filters;
using YL.Helpers;

namespace YL.Filters
{
	public class AlbumSystemMasterAttribute : ActionFilterAttribute
	{
		public override void OnActionExecuting(ActionExecutingContext context)
		{
			var session = AlbumCookieHelper.GetSession(context.HttpContext.Request);

			if (session == null)
			{
				throw new UnauthorizedAccessException("로그인이 필요합니다.");
			}

			if (!session.IsSystemMaster)
			{
				throw new UnauthorizedAccessException("권한이 없습니다.");
			}

			base.OnActionExecuting(context);
		}
	}
}
