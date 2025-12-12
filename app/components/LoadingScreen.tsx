export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center space-y-6 animate-fade">
        {/* Jazz Logo */}
        <img
          src="/jazz-logo.webp"
          alt="Jazz Logo"
          className="w-32 h-16 object-contain"
        />
        
        {/* Verifying text */}
        <p className="text-gray-700 text-lg font-medium animate-pulse">
          Verifying
        </p>
      </div>

      <style jsx>{`
        @keyframes fade {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-fade {
          animation: fade 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
