import React from "react";

function Loader() {
  return (
    <div>
      <div className="flex items-center justify-center h-screen bg-gray-900">
        {/* Outer Glow Pulses */}
        <div className="relative w-40 h-40">
          <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-50"></div>
          <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping delay-200 opacity-50"></div>

          {/* Neon Ring */}
          <div className="absolute inset-0 w-16 h-16 m-auto border-4 border-cyan-500 rounded-full border-t-transparent  animate-spin-slow"></div>

          {/* Neon Rotating Square */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-purple-500/20 rounded-md animate-fade-in-out"></div>
            <div
              className="absolute w-40 h-40 border border-cyan-500 rotate-90 animate-spin-slow"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
            ></div>
          </div>
          <div className="absolute inset-0 m-auto right-0 left-[0.9rem] top-[0.9rem] bottom-0 grid grid-cols-3 grid-rows-3 gap-1">
            {[...Array(9)].map((_, index) => (
              <div
                key={index}
                className="w-8 h-8 bg-cyan-500 rounded-md animate-fade-in-out"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                }}
              ></div>
            ))}
          </div>

          {/* Neon Lines */}
          <div className="lines animate-fade-in-out">
            <div className="absolute w-full h-1 bg-cyan-500 top-1/2 animate-glow-line animate-glow opacity-75"></div>
            <div className="absolute h-full w-1 bg-cyan-500 left-1/2 animate-glow-line opacity-75 animate-glow"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loader;
