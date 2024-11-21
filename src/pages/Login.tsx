const GoogleLogin = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-cyan-700 to-blue-800">
      <div className="cyber-card p-8 w-full max-w-sm rounded-lg shadow-lg bg-gray-800">
        <h2 className="text-2xl font-semibold text-center text-white mb-6">
          Login with Google
        </h2>

        {/* Google Login Button */}
        <button className="w-full py-3  px-6 flex items-center justify-around bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-all">
          {/* Google Logo as SVG */}
          <svg
            className="w-7 h-7"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
            fill-rule="evenodd"
            clip-rule="evenodd"
            stroke-linejoin="round"
            stroke-miterlimit="2"
          >
            <path d="M32.582 370.734C15.127 336.291 5.12 297.425 5.12 256c0-41.426 10.007-80.291 27.462-114.735C74.705 57.484 161.047 0 261.12 0c69.12 0 126.836 25.367 171.287 66.793l-73.31 73.309c-26.763-25.135-60.276-38.168-97.977-38.168-66.56 0-123.113 44.917-143.36 105.426-5.12 15.36-8.146 31.65-8.146 48.64 0 16.989 3.026 33.28 8.146 48.64l-.303.232h.303c20.247 60.51 76.8 105.426 143.36 105.426 34.443 0 63.534-9.31 86.341-24.67 27.23-18.152 45.382-45.148 51.433-77.032H261.12v-99.142h241.105c3.025 16.757 4.654 34.211 4.654 52.364 0 77.963-27.927 143.592-76.334 188.276-42.356 39.098-100.305 61.905-169.425 61.905-100.073 0-186.415-57.483-228.538-141.032v-.233z" />
          </svg>
          <span className="text-sm font-semibold">Continue with Google</span>
        </button>

        {/* Separator */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-400"></div>
          <span className="mx-2 text-gray-400">or</span>
          <div className="flex-1 border-t border-gray-400"></div>
        </div>

        {/* Alternative Login Option */}
        <div className="text-center text-gray-400">
          <p className="text-sm">
            Don't have an account?{" "}
            <a href="#" className="text-cyan-400 hover:text-cyan-500">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleLogin;
