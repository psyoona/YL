using Microsoft.AspNetCore.Mvc;
using YL.Filters;
using YL.Helpers;
using YL.Services;

namespace YL.Controllers.Webs
{
	public class AlbumController : BaseController
	{
		[HttpGet]
		public ActionResult Login()
		{
			this.Initialize();

			if (AlbumCookieHelper.GetSession(Request) != null)
			{
				return this.RedirectToAction("Index");
			}

			return this.View();
		}

		[HttpPost]
		public JsonResult Authenticate(string phoneNumber, string password)
		{
			var result = new AlbumService().Authenticate(phoneNumber, password);

			if (result.Session != null)
			{
				AlbumCookieHelper.SetSession(Response, result.Session);
			}

			return this.Json(new { success = result.IsValid, userName = result.UserName });
		}

		[HttpGet]
		public ActionResult Logout()
		{
			AlbumCookieHelper.ClearSession(Response);
			return this.RedirectToAction("Login");
		}

		[HttpGet]
		public ActionResult Index()
		{
			this.Initialize();

			var session = AlbumCookieHelper.GetSession(Request);

			if (session == null)
			{
				return this.RedirectToAction("Login");
			}

			ViewBag.UserName = session.UserName;
			ViewBag.IsSystemMaster = session.IsSystemMaster;

			return this.View();
		}

		[HttpPost]
		[AlbumLoginRequired]
		public JsonResult GetAlbumList()
		{
			var session = AlbumCookieHelper.GetSession(Request)!;
			var albums = new AlbumService().GetAccessibleAlbums(session);

			return this.Json(new { albums });
		}

		[HttpPost]
		[AlbumLoginRequired]
		public JsonResult GetPhotoList(string albumName)
		{
			var session = AlbumCookieHelper.GetSession(Request)!;
			var service = new AlbumService();
			service.ValidateAlbumAccess(albumName, session);

			var photos = service.GetPhotoList(albumName);

			return this.Json(new { photos });
		}

		[HttpGet]
		[AlbumLoginRequired]
		[ResponseCache(Duration = 86400, Location = ResponseCacheLocation.Client)]
		public ActionResult GetPhoto(string albumName, string fileName)
		{
			var session = AlbumCookieHelper.GetSession(Request)!;
			var service = new AlbumService();
			service.ValidateAlbumAccess(albumName, session);

			var result = service.GetPhoto(albumName, fileName);

			if (result == null)
			{
				return this.NotFound();
			}

			return this.File(result.Value.data, result.Value.contentType);
		}

		[HttpGet]
		[AlbumLoginRequired]
		[ResponseCache(Duration = 86400, Location = ResponseCacheLocation.Client)]
		public ActionResult GetThumbnail(string albumName, string fileName)
		{
			var session = AlbumCookieHelper.GetSession(Request)!;
			var service = new AlbumService();
			service.ValidateAlbumAccess(albumName, session);

			var result = service.GetThumbnail(albumName, fileName);

			if (result == null)
			{
				return this.NotFound();
			}

			return this.File(result.Value.data, result.Value.contentType);
		}

		[HttpPost]
		[AlbumLoginRequired]
		[RequestSizeLimit(50_000_000)]
		public JsonResult UploadPhotos(string albumName, List<IFormFile> files)
		{
			var session = AlbumCookieHelper.GetSession(Request)!;
			var service = new AlbumService();
			service.ValidateAlbumAccess(albumName, session);

			var photos = service.UploadPhotos(albumName, files);

			return this.Json(new { photos });
		}

		[HttpPost]
		[AlbumLoginRequired]
		public JsonResult DeletePhoto(string albumName, string fileName, int photoId)
		{
			var session = AlbumCookieHelper.GetSession(Request)!;
			var service = new AlbumService();
			service.ValidateAlbumAccess(albumName, session);
			service.DeletePhoto(albumName, fileName, photoId);

			return this.Json(new { success = true });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult CreateAlbum(string albumName, string displayName)
		{
			new AlbumService().CreateAlbum(albumName, displayName);

			return this.Json(new { success = true });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult UpdateAlbum(string albumName, string displayName)
		{
			new AlbumService().UpdateAlbum(albumName, displayName);

			return this.Json(new { success = true });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult DeleteAlbum(string albumName)
		{
			new AlbumService().DeleteAlbum(albumName);

			return this.Json(new { success = true });
		}

		[HttpGet]
		public ActionResult Admin()
		{
			this.Initialize();

			var session = AlbumCookieHelper.GetSession(Request);

			if (session == null)
			{
				return this.RedirectToAction("Login");
			}

			if (!session.IsSystemMaster)
			{
				return this.RedirectToAction("Index");
			}

			ViewBag.UserName = session.UserName;

			return this.View();
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult GetRoles()
		{
			var roles = new AlbumService().GetAllRoles();

			return this.Json(new { roles });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult AddRole(string roleName)
		{
			new AlbumService().AddRole(roleName);

			return this.Json(new { success = true });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult DeleteRole(int roleId)
		{
			new AlbumService().DeleteRole(roleId);

			return this.Json(new { success = true });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult GetUsers()
		{
			var service = new AlbumService();
			var users = service.GetAllUsers();
			var userRoles = service.GetAllUserRoles();

			return this.Json(new { users, userRoles });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult AssignUserRole(string phoneNumber, int roleId)
		{
			new AlbumService().AssignUserRole(phoneNumber, roleId);

			return this.Json(new { success = true });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult RemoveUserRole(int userRoleId)
		{
			new AlbumService().RemoveUserRole(userRoleId);

			return this.Json(new { success = true });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult GetAlbumAccess()
		{
			var service = new AlbumService();
			var accessList = service.GetAllAlbumAccess();
			var albums = service.GetAlbumList();
			var roles = service.GetAllRoles();

			return this.Json(new { accessList, albums, roles });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult AddAlbumAccess(string albumName, int roleId)
		{
			new AlbumService().AddAlbumAccess(albumName, roleId);

			return this.Json(new { success = true });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult RemoveAlbumAccess(int accessId)
		{
			new AlbumService().RemoveAlbumAccess(accessId);

			return this.Json(new { success = true });
		}
	}
}
