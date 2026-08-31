import {
  useEffect,
  useRef,
  useState,
} from 'react';

import toast from 'react-hot-toast';

import {
  Camera,
  User as UserIcon,
  X,
} from 'lucide-react';

import {
  useAppDispatch,
  useAppSelector,
} from '../../hooks/redux';

import {
  setUser,
} from '../../features/authSlice';

import api, {
  getErrorMessage,
} from '../../services/api';

const Profile = () => {
  const dispatch =
    useAppDispatch();

  const { user } =
    useAppSelector(
      (state) => state.auth
    );

  // ==========================================================
  // FORM
  // ==========================================================

  const [form, setForm] =
    useState({
      name: user?.name || '',
      phone: user?.phone || '',
    });

  const [
    avatarFile,
    setAvatarFile,
  ] =
    useState<File | null>(
      null
    );

  const [
    avatarPreview,
    setAvatarPreview,
  ] =
    useState<string | null>(
      user?.avatar || null
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(
      null
    );

  // ==========================================================
  // SYNC USER DATA
  // ==========================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm({
      name:
        user.name || '',

      phone:
        user.phone || '',
    });

    if (!avatarFile) {
      setAvatarPreview(
        user.avatar || null
      );
    }
  }, [user, avatarFile]);

  // ==========================================================
  // SELECT PROFILE PICTURE
  // ==========================================================

  const handleAvatarChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    // Check image type
    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      toast.error(
        'Please select a valid image'
      );

      event.target.value = '';

      return;
    }

    // Maximum 5 MB
    const maxSize =
      5 * 1024 * 1024;

    if (
      file.size > maxSize
    ) {
      toast.error(
        'Profile picture is too large'
      );

      event.target.value = '';

      return;
    }

    // Remove previous temporary preview
    if (
      avatarPreview?.startsWith(
        'blob:'
      )
    ) {
      URL.revokeObjectURL(
        avatarPreview
      );
    }

    const previewUrl =
      URL.createObjectURL(
        file
      );

    setAvatarFile(
      file
    );

    setAvatarPreview(
      previewUrl
    );
  };

  // ==========================================================
  // CANCEL NEW PICTURE
  // ==========================================================

  const cancelSelectedAvatar =
    () => {
      if (
        avatarPreview?.startsWith(
          'blob:'
        )
      ) {
        URL.revokeObjectURL(
          avatarPreview
        );
      }

      setAvatarFile(null);

      setAvatarPreview(
        user?.avatar ||
          null
      );

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          '';
      }
    };

  // ==========================================================
  // SAVE PROFILE
  // ==========================================================

  const submit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (
      !form.name.trim()
    ) {
      toast.error(
        'Full name is required'
      );

      return;
    }

    if (
      !form.phone.trim()
    ) {
      toast.error(
        'Phone number is required'
      );

      return;
    }

    setSaving(true);

    try {
      const formData =
        new FormData();

      formData.append(
        'name',
        form.name.trim()
      );

      formData.append(
        'phone',
        form.phone.trim()
      );

      if (avatarFile) {
        formData.append(
          'avatar',
          avatarFile
        );
      }

      const response =
        await api.put(
          '/auth/profile',
          formData
        );

      const updatedUser =
        response.data.data
          .user;

      // Update Redux user
      dispatch(
        setUser(
          updatedUser
        )
      );

      // Remove temporary preview URL
      if (
        avatarPreview?.startsWith(
          'blob:'
        )
      ) {
        URL.revokeObjectURL(
          avatarPreview
        );
      }

      setAvatarPreview(
        updatedUser.avatar ||
          null
      );

      setAvatarFile(
        null
      );

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          '';
      }

      toast.success(
        'Profile updated successfully'
      );
    } catch (error) {
      toast.error(
        getErrorMessage(
          error
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="card p-6 max-w-lg">

      {/* TITLE */}

      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        My Profile
      </h1>

      <form
        onSubmit={submit}
        className="space-y-5"
      >

        {/* ===================================================
            PROFILE PICTURE
        ==================================================== */}

        <div className="flex flex-col items-center">

          <div className="relative">

            {/* AVATAR */}

            <div
              className="
                w-28
                h-28
                rounded-full
                overflow-hidden
                border-4
                border-white
                dark:border-gray-700
                shadow-md
                bg-gray-100
                dark:bg-gray-800
                flex
                items-center
                justify-center
              "
            >

              {avatarPreview ? (
                <img
                  src={
                    avatarPreview
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon
                  size={48}
                  className="text-gray-400 dark:text-gray-500"
                />
              )}

            </div>

            {/* CAMERA BUTTON */}

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="
                absolute
                bottom-0
                right-0
                w-9
                h-9
                rounded-full
                bg-brand-600
                hover:bg-brand-700
                text-white
                flex
                items-center
                justify-center
                shadow-md
                transition
              "
              title="Profile picture"
            >
              <Camera
                size={17}
              />
            </button>

          </div>

          {/* HIDDEN FILE INPUT */}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={
              handleAvatarChange
            }
          />

          {/* UPLOAD / CHANGE */}

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="
              mt-3
              text-sm
              font-medium
              text-brand-600
              dark:text-brand-400
              hover:underline
            "
          >
            {user?.avatar
              ? 'Change Profile Picture'
              : 'Upload Profile Picture'}
          </button>

          {/* =================================================
              JPG / PNG / WEBP TEXT REMOVED
          ================================================== */}

          {/* NEW IMAGE SELECTED */}

          {avatarFile && (
            <div className="mt-2 flex flex-col items-center gap-1">

              <p className="text-xs text-green-600 dark:text-green-400">
                New profile picture selected
              </p>

              <button
                type="button"
                onClick={
                  cancelSelectedAvatar
                }
                className="
                  flex
                  items-center
                  gap-1
                  text-xs
                  text-red-500
                  hover:text-red-600
                  dark:hover:text-red-400
                "
              >
                <X
                  size={13}
                />

                Cancel selected picture
              </button>

            </div>
          )}

        </div>

        {/* ===================================================
            FULL NAME
        ==================================================== */}

        <div>

          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name
          </label>

          <input
            type="text"
            className="input-field mt-1"
            value={
              form.name
            }
            onChange={(
              event
            ) =>
              setForm(
                (
                  current
                ) => ({
                  ...current,

                  name:
                    event.target
                      .value,
                })
              )
            }
            required
          />

        </div>

        {/* ===================================================
            EMAIL
        ==================================================== */}

        <div>

          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>

          <input
            type="email"
            className="
              input-field
              mt-1
              bg-gray-50
              dark:bg-gray-800
              cursor-not-allowed
            "
            value={
              user?.email ||
              ''
            }
            disabled
          />

          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Email cannot be changed here.
          </p>

        </div>

        {/* ===================================================
            PHONE NUMBER
        ==================================================== */}

        <div>

          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone Number
          </label>

          <input
            type="text"
            className="input-field mt-1"
            value={
              form.phone
            }
            onChange={(
              event
            ) =>
              setForm(
                (
                  current
                ) => ({
                  ...current,

                  phone:
                    event.target
                      .value,
                })
              )
            }
            required
          />

        </div>

        {/* ===================================================
            SAVE BUTTON
        ==================================================== */}

        <button
          type="submit"
          className="btn-primary"
          disabled={
            saving
          }
        >
          {saving
            ? 'Saving...'
            : 'Save Changes'}
        </button>

      </form>

    </div>
  );
};

export default Profile;