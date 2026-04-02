using System.Data;
using Microsoft.Data.SqlClient;
using YL.Functions;
using YL.Models.Dtos.Webs;

namespace YL.Models.Daos
{
	public class AlbumDao : BaseCommonDao
	{
		public AlbumDao()
		{
			this.ConnectionString = this.GetConnectionString();
		}

		public AlbumUser Login(string phoneNumber, string passwordHash)
		{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@PHONE_NUMBER", SqlDbType.NVarChar) { Value = phoneNumber },
				new SqlParameter("@PASSWORD_HASH", SqlDbType.NVarChar) { Value = passwordHash }
			};

			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_ALBUM_USER_LOGIN",
				parameters);

			AlbumUser albumUser = new AlbumUser();

			if (sqlDataReader.Read())
			{
				albumUser.IsValid = sqlDataReader.GetBoolean(sqlDataReader.GetOrdinal("IS_VALID"));
				albumUser.UserName = sqlDataReader.GetString(sqlDataReader.GetOrdinal("USER_NAME"));
			}

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return albumUser;
		}

		public List<AlbumPhoto> GetPhotos(string albumName)
		{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ALBUM_NAME", SqlDbType.NVarChar) { Value = albumName }
			};

			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_ALBUM_GET_PHOTOS",
				parameters);

			List<AlbumPhoto> photos = Binder.BindToList<AlbumPhoto>(sqlDataReader);

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return photos;
		}

		public void UpsertPhoto(string albumName, string fileName, int width, int height, long fileSize, int displayOrder)
		{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ALBUM_NAME", SqlDbType.NVarChar) { Value = albumName },
				new SqlParameter("@FILE_NAME", SqlDbType.NVarChar) { Value = fileName },
				new SqlParameter("@WIDTH", SqlDbType.Int) { Value = width },
				new SqlParameter("@HEIGHT", SqlDbType.Int) { Value = height },
				new SqlParameter("@FILE_SIZE", SqlDbType.BigInt) { Value = fileSize },
				new SqlParameter("@DISPLAY_ORDER", SqlDbType.Int) { Value = displayOrder }
			};

			SqlHelper.ExecuteNonQuery(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_ALBUM_UPSERT_PHOTO",
				parameters);
		}

		public void DeletePhoto(int photoId)
		{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@PHOTO_ID", SqlDbType.Int) { Value = photoId }
			};

			SqlHelper.ExecuteNonQuery(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_ALBUM_DELETE_PHOTO",
				parameters);
		}

		// ============================================
		// 앨범 관련
		// ============================================

		public List<AlbumInfo> GetAlbums()
		{
			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_ALBUM_GET_ALBUMS");

			List<AlbumInfo> albums = Binder.BindToList<AlbumInfo>(sqlDataReader);

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return albums;
		}

		public bool CreateAlbum(string albumName, string displayName)
		{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ALBUM_NAME", SqlDbType.NVarChar) { Value = albumName },
				new SqlParameter("@DISPLAY_NAME", SqlDbType.NVarChar) { Value = displayName }
			};

			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_ALBUM_CREATE_ALBUM",
				parameters);

			bool success = false;

			if (sqlDataReader.Read())
			{
				success = sqlDataReader.GetBoolean(sqlDataReader.GetOrdinal("SUCCESS"));
			}

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return success;
		}

		public bool DeleteAlbumFromDb(string albumName)
		{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ALBUM_NAME", SqlDbType.NVarChar) { Value = albumName }
			};

			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_ALBUM_DELETE_ALBUM",
				parameters);

			bool success = false;

			if (sqlDataReader.Read())
			{
				success = sqlDataReader.GetBoolean(sqlDataReader.GetOrdinal("SUCCESS"));
			}

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return success;
		}

		public bool UpdateAlbum(string albumName, string displayName)
		{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ALBUM_NAME", SqlDbType.NVarChar) { Value = albumName },
				new SqlParameter("@DISPLAY_NAME", SqlDbType.NVarChar) { Value = displayName }
			};

			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_ALBUM_UPDATE_ALBUM",
				parameters);

			bool success = false;

			if (sqlDataReader.Read())
			{
				success = sqlDataReader.GetBoolean(sqlDataReader.GetOrdinal("SUCCESS"));
			}

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return success;
		}

		// ============================================
		// 역할 관련
		// ============================================

		public List<AlbumRole> GetUserRoles(string phoneNumber)
		{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@PHONE_NUMBER", SqlDbType.NVarChar) { Value = phoneNumber }
			};

			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_ALBUM_GET_USER_ROLES",
				parameters);

			List<AlbumRole> roles = Binder.BindToList<AlbumRole>(sqlDataReader);

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return roles;
		}

		public List<AlbumRole> GetAllRoles()
		{
			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_ALBUM_GET_ALL_ROLES");

			List<AlbumRole> roles = Binder.BindToList<AlbumRole>(sqlDataReader);

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return roles;
		}

		public bool AddRole(string roleName)
		{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ROLE_NAME", SqlDbType.NVarChar) { Value = roleName }
			};

			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_ALBUM_ADD_ROLE",
				parameters);

			bool success = false;

			if (sqlDataReader.Read())
			{
				success = sqlDataReader.GetBoolean(sqlDataReader.GetOrdinal("SUCCESS"));
			}

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return success;
		}

		public bool DeleteRole(int roleId)
		{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ROLE_ID", SqlDbType.Int) { Value = roleId }
			};

			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_ALBUM_DELETE_ROLE",
				parameters);

			bool success = false;

			if (sqlDataReader.Read())
			{
				success = sqlDataReader.GetBoolean(sqlDataReader.GetOrdinal("SUCCESS"));
			}

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return success;
		}

		// ============================================
		// 사용자 관련
		// ============================================

		public List<AlbumUserInfo> GetAllUsers()
		{
			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_ALBUM_GET_ALL_USERS");

			List<AlbumUserInfo> users = Binder.BindToList<AlbumUserInfo>(sqlDataReader);

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return users;
		}

		public List<AlbumUserRoleMapping> GetAllUserRoles()
		{
			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_ALBUM_GET_ALL_USER_ROLES");

			List<AlbumUserRoleMapping> mappings = Binder.BindToList<AlbumUserRoleMapping>(sqlDataReader);

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return mappings;
		}

		public bool AssignUserRole(string phoneNumber, int roleId)
		{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@PHONE_NUMBER", SqlDbType.NVarChar) { Value = phoneNumber },
				new SqlParameter("@ROLE_ID", SqlDbType.Int) { Value = roleId }
			};

			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_ALBUM_ASSIGN_USER_ROLE",
				parameters);

			bool success = false;

			if (sqlDataReader.Read())
			{
				success = sqlDataReader.GetBoolean(sqlDataReader.GetOrdinal("SUCCESS"));
			}

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return success;
		}

		public bool RemoveUserRole(int userRoleId)
		{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@USER_ROLE_ID", SqlDbType.Int) { Value = userRoleId }
			};

			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_ALBUM_REMOVE_USER_ROLE",
				parameters);

			bool success = false;

			if (sqlDataReader.Read())
			{
				success = sqlDataReader.GetBoolean(sqlDataReader.GetOrdinal("SUCCESS"));
			}

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return success;
		}

		// ============================================
		// 앨범 접근 관련
		// ============================================

		public List<AlbumAccessMapping> GetAllAlbumAccess()
		{
			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_ALBUM_GET_ALL_ALBUM_ACCESS");

			List<AlbumAccessMapping> mappings = Binder.BindToList<AlbumAccessMapping>(sqlDataReader);

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return mappings;
		}

		public bool AddAlbumAccess(string albumName, int roleId)
		{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ALBUM_NAME", SqlDbType.NVarChar) { Value = albumName },
				new SqlParameter("@ROLE_ID", SqlDbType.Int) { Value = roleId }
			};

			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_ALBUM_ADD_ALBUM_ACCESS",
				parameters);

			bool success = false;

			if (sqlDataReader.Read())
			{
				success = sqlDataReader.GetBoolean(sqlDataReader.GetOrdinal("SUCCESS"));
			}

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return success;
		}

		public bool RemoveAlbumAccess(int accessId)
		{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ACCESS_ID", SqlDbType.Int) { Value = accessId }
			};

			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_ALBUM_REMOVE_ALBUM_ACCESS",
				parameters);

			bool success = false;

			if (sqlDataReader.Read())
			{
				success = sqlDataReader.GetBoolean(sqlDataReader.GetOrdinal("SUCCESS"));
			}

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return success;
		}
	}
}
