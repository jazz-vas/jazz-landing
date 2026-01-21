import Image from 'next/image';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center space-y-6">
        {/* Jazz Logo */}
        <Image
          src="/landing/jazz-logo.webp"
          alt="Jazz Logo"
          width={160}
          height={80}
          className="object-contain animate-fade"
        />
        
        {/* Verifying text */}
        <p className="text-gray-700 text-lg font-medium">
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
