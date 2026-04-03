import React, { useState, useEffect, useRef } from "react";
import { FaCamera, FaFolderOpen, FaTrash } from "react-icons/fa";

const ProfileForm = ({ profile, onUpdate, onReset }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthday: "",
    university: "",
    degree: "",
    currentYear: "",
    currentSemester: "",
    gpa: "",
    skills: "",
    bio: "",
    email: "",
    interests: "",
  });

  const [focusedField, setFocusedField] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [showPictureMenu, setShowPictureMenu] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        birthday: profile.birthday
          ? new Date(profile.birthday).toISOString().split("T")[0]
          : "",
        university: profile.university || "",
        degree: profile.degree || "",
        currentYear: profile.currentYear || "",
        currentSemester: profile.currentSemester || "",
        gpa: profile.gpa || "",
        skills: profile.skills?.join(", ") || "",
        bio: profile.bio || "",
        email: profile.email || "",
        interests: profile.interests?.join(", ") || "",
      });
      if (profile.profilePicture) {
        setProfilePicturePreview(profile.profilePicture);
      } else {
        setProfilePicturePreview(null);
      }
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const compressImage = (imageData, callback) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 400;
      const MAX_HEIGHT = 400;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      // Compress with 0.7 quality (reduces size significantly)
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
      console.log(
        "Image compressed from",
        imageData.length,
        "to",
        compressedBase64.length,
      );
      callback(compressedBase64);
    };
    img.src = imageData;
  };

  const processProfilePictureFile = (file) => {
    if (file) {
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert(
          "Image size must be less than 5MB. Please choose a smaller image.",
        );
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Original image size (base64):", reader.result.length);
        // Compress the image
        compressImage(reader.result, (compressedBase64) => {
          setProfilePicturePreview(compressedBase64);
        });
      };
      reader.onerror = () => {
        console.error("Error reading file:", reader.error);
      };
      reader.readAsDataURL(file);
      if (cameraInputRef.current) {
        cameraInputRef.current.value = "";
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    processProfilePictureFile(file);
    setShowPictureMenu(false);
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCameraStream = async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      return true;
    } catch (error) {
      console.error("Could not access camera:", error);
      setCameraError(
        "Could not open device camera. Falling back to file picker.",
      );
      return false;
    }
  };

  const handleOpenCamera = async () => {
    setShowPictureMenu(false);
    setShowCameraDialog(true);

    const opened = await startCameraStream();
    if (!opened) {
      cameraInputRef.current?.click();
    }
  };

  const handleCaptureFromCamera = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      setCameraError("Camera is not ready yet. Please try again.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    compressImage(imageData, (compressedBase64) => {
      setProfilePicturePreview(compressedBase64);
    });

    stopCameraStream();
    setShowCameraDialog(false);
  };

  const handleCloseCameraDialog = () => {
    stopCameraStream();
    setShowCameraDialog(false);
    setCameraError("");
  };

  const handleOpenFileBrowser = () => {
    fileInputRef.current?.click();
  };

  const handleDeletePicture = () => {
    setProfilePicturePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
    setShowPictureMenu(false);
    stopCameraStream();
    setShowCameraDialog(false);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedData = {
      ...formData,
      skills: formData.skills
        ? formData.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      interests: formData.interests
        ? formData.interests
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean)
        : [],
      currentYear: formData.currentYear ? Number(formData.currentYear) : null,
      currentSemester: formData.currentSemester
        ? Number(formData.currentSemester)
        : null,
      gpa: formData.gpa ? Number(formData.gpa) : null,
      profilePicture: profilePicturePreview,
    };

    console.log("Submitting profile with image:", {
      hasImage: !!profilePicturePreview,
      imageSize: profilePicturePreview?.length,
    });

    onUpdate(updatedData);
  };

  const FloatingInput = ({ label, name, type = "text", ...props }) => {
    const isFocused = focusedField === name;
    const hasValue = formData[name];

    return (
      <div className="relative group">
        <div className="relative">
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            onFocus={() => setFocusedField(name)}
            onBlur={() => setFocusedField(null)}
            className={`w-full pl-4 pr-4 pt-6 pb-2 border rounded-xl outline-none transition-all duration-200  ${
              isFocused
                ? "border-indigo-500 bg-white dark:bg-gray-700 dark:border-indigo-400 ring-2 ring-indigo-100 dark:ring-indigo-900 shadow-sm"
                : "border-slate-300 dark:border-gray-600 bg-slate-100/90 dark:bg-gray-700 hover:border-slate-400 dark:hover:border-gray-500"
            }`}
            placeholder=" "
            {...props}
          />
          <label
            className={`absolute left-4 transition-all duration-300 pointer-events-none ${
              isFocused || hasValue
                ? "top-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                : "top-1/2 -translate-y-1/2 text-base text-slate-400 dark:text-gray-500"
            }`}
          >
            {label}
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-indigo-50/40 to-cyan-50/30 dark:from-gray-800 dark:via-gray-800/60 dark:to-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-gray-700 p-7 shadow-sm dark:shadow-lg">
      <div className="mb-6 pb-4 border-b border-slate-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100 mb-0.5">
            Edit Profile
          </h2>
          <p className="text-sm text-slate-600 dark:text-gray-400">
            Update your personal and academic information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture Upload */}
        <div className="flex flex-col items-center mb-6 pb-6 border-b border-slate-200 dark:border-gray-700">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white text-4xl font-semibold overflow-hidden border-4 border-slate-200 dark:border-gray-600">
              {profilePicturePreview ? (
                <img
                  src={profilePicturePreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  {formData.firstName?.[0]?.toUpperCase() || "U"}
                  {formData.lastName?.[0]?.toUpperCase() || "P"}
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowPictureMenu((prev) => !prev)}
              className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 dark:from-indigo-600 dark:to-indigo-700 dark:hover:from-indigo-700 dark:hover:to-indigo-600 text-white rounded-full cursor-pointer shadow-lg dark:shadow-xl hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 flex items-center justify-center border-4 border-white dark:border-gray-700 hover:scale-110 active:scale-95"
              aria-label="Open profile picture options"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-3">
            Click the + to open picture options
          </p>
        </div>

        {showPictureMenu && (
          <>
            <button
              type="button"
              aria-label="Close picture options dialog"
              className="fixed inset-0 bg-black/30 z-50"
              onClick={() => setShowPictureMenu(false)}
            />
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Profile Picture
                  </h3>
                  <button
                    type="button"
                    onClick={handleDeletePicture}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Delete profile picture"
                    disabled={!profilePicturePreview}
                  >
                    <FaTrash size={13} />
                  </button>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleOpenCamera}
                    className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition flex items-center gap-3"
                  >
                    <FaCamera className="text-blue-500" size={15} />
                    <div>
                      <div className="font-medium">Use Camera</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Take a photo and upload
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenFileBrowser}
                    className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition flex items-center gap-3"
                  >
                    <FaFolderOpen className="text-indigo-500" size={15} />
                    <div>
                      <div className="font-medium">Browse Device</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Select an existing photo
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowPictureMenu(false)}
                    className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {showCameraDialog && (
          <>
            <button
              type="button"
              aria-label="Close camera dialog"
              className="fixed inset-0 bg-black/30 z-50"
              onClick={handleCloseCameraDialog}
            />
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl p-5">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Use Camera
                </h3>

                <div className="rounded-lg overflow-hidden bg-black mb-3">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover"
                  />
                </div>

                {cameraError && (
                  <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                    {cameraError}
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseCameraDialog}
                    className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCaptureFromCamera}
                    className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                  >
                    Capture
                  </button>
                </div>

                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>
          </>
        )}

        {/* Name Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <FloatingInput label="First Name" name="firstName" required />
          <FloatingInput label="Last Name" name="lastName" required />
        </div>

        {/* Email and Birthday */}
        <div className="grid md:grid-cols-2 gap-4">
          <FloatingInput
            label="Email Address"
            name="email"
            type="email"
            required
          />
          <FloatingInput label="Birthday" name="birthday" type="date" />
        </div>

        {/* University and Degree */}
        <div className="grid md:grid-cols-2 gap-4">
          <FloatingInput label="University" name="university" />
          <FloatingInput label="Degree Program" name="degree" />
        </div>

        {/* Academic Year and Semester */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <select
              name="currentYear"
              value={formData.currentYear}
              onChange={handleChange}
              onFocus={() => setFocusedField("currentYear")}
              onBlur={() => setFocusedField(null)}
              className={`w-full px-4 py-3.5 border rounded-xl outline-none transition-all duration-200 appearance-none ${
                focusedField === "currentYear"
                  ? "border-indigo-500 dark:border-indigo-400 bg-white dark:bg-gray-700 ring-2 ring-indigo-100 dark:ring-indigo-900 shadow-sm"
                  : "border-slate-300 dark:border-gray-600 bg-slate-100/90 dark:bg-gray-700 hover:border-slate-400 dark:hover:border-gray-500 text-slate-900 dark:text-gray-100"
              }`}
            >
              <option value="">Select Year</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
              <option value="5">Year 5</option>
            </select>
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-gray-500 text-xs">
              ▼
            </span>
          </div>

          <div className="relative">
            <select
              name="currentSemester"
              value={formData.currentSemester}
              onChange={handleChange}
              onFocus={() => setFocusedField("currentSemester")}
              onBlur={() => setFocusedField(null)}
              className={`w-full px-4 py-3.5 border rounded-xl outline-none transition-all duration-200 appearance-none ${
                focusedField === "currentSemester"
                  ? "border-indigo-500 dark:border-indigo-400 bg-white dark:bg-gray-700 ring-2 ring-indigo-100 dark:ring-indigo-900 shadow-sm"
                  : "border-slate-300 dark:border-gray-600 bg-slate-100/90 dark:bg-gray-700 hover:border-slate-400 dark:hover:border-gray-500 text-slate-900 dark:text-gray-100"
              }`}
            >
              <option value="">Select Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-gray-500 text-xs">
              ▼
            </span>
          </div>
        </div>

        {/* Current GPA */}
        <FloatingInput
          label="Current GPA (e.g., 3.75)"
          name="gpa"
          type="number"
          step="0.01"
          min="0"
          max="4"
        />

        {/* Skills */}
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              onFocus={() => setFocusedField("skills")}
              onBlur={() => setFocusedField(null)}
              placeholder=" "
              className={`w-full pl-4 pr-4 pt-6 pb-2 border rounded-xl outline-none transition-all duration-200 ${
                focusedField === "skills"
                  ? "border-indigo-500 bg-white ring-2 ring-indigo-100 shadow-sm"
                  : "border-slate-300 bg-slate-100/90 hover:border-slate-400"
              }`}
            />
            <label
              className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                focusedField === "skills" || formData.skills
                  ? "top-1.5 text-xs font-medium text-indigo-600"
                  : "top-1/2 -translate-y-1/2 text-sm text-slate-400"
              }`}
            >
              Skills (e.g., React, Node.js, Python)
            </label>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 ml-1">
            Separate skills with commas
          </p>
        </div>

        {/* Bio */}
        <div className="relative">
          <div className="relative">
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              onFocus={() => setFocusedField("bio")}
              onBlur={() => setFocusedField(null)}
              rows="5"
              placeholder=" "
              maxLength="500"
              className={`w-full pl-4 pr-4 pt-6 pb-2 border rounded-xl outline-none transition-all duration-200 resize-none ${
                focusedField === "bio"
                  ? "border-indigo-500 dark:border-indigo-400 bg-white dark:bg-gray-700 ring-2 ring-indigo-100 dark:ring-indigo-900 shadow-sm text-slate-900 dark:text-gray-200"
                  : "border-slate-300 dark:border-gray-600 bg-slate-100/90 dark:bg-gray-700 hover:border-slate-400 dark:hover:border-gray-500 text-slate-900 dark:text-gray-200"
              }`}
            />
            <label
              className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                focusedField === "bio" || formData.bio
                  ? "top-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400"
                  : "top-6 text-sm text-slate-400 dark:text-gray-500"
              }`}
            >
              Tell us about yourself
            </label>
          </div>
          <div className="flex justify-between items-center mt-1 ml-1">
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Share a short personal summary
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              {formData.bio.length}/500 characters
            </p>
          </div>
        </div>

        {/* Interests */}
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              onFocus={() => setFocusedField("interests")}
              onBlur={() => setFocusedField(null)}
              placeholder=" "
              className={`w-full pl-4 pr-4 pt-6 pb-2 border rounded-xl outline-none transition-all duration-200 ${
                focusedField === "interests"
                  ? "border-indigo-500 bg-white ring-2 ring-indigo-100 shadow-sm"
                  : "border-slate-300 bg-slate-100/90 hover:border-slate-400"
              }`}
            />
            <label
              className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                focusedField === "interests" || formData.interests
                  ? "top-1.5 text-xs font-medium text-indigo-600"
                  : "top-1/2 -translate-y-1/2 text-sm text-slate-400"
              }`}
            >
              Interests (e.g., Sports, Music, Reading)
            </label>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 ml-1">
            Separate interests with commas
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-700 dark:to-blue-700 hover:from-indigo-700 hover:to-blue-700 dark:hover:from-indigo-600 dark:hover:to-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-sm dark:shadow-lg"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex-1 bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-slate-800 dark:text-gray-200 font-medium py-3 px-6 rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
