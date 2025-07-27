const About = () => {
  return (
    <section id="about" className="pt-16 bg-white min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Tentang Kami
        </h2>

        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <img
              src="/volkswagen.webp"
              alt="Volkswagen Service Center"
              className="rounded-lg shadow-xl w-full max-w-2xl mx-auto"
            />
          </div>

          <div className="lg:w-1/2 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Visi</h3>
                  <p className="text-gray-600">
                    Menjadi bengkel resmi Volkswagen terdepan di Indonesia yang
                    memberikan pengalaman servis premium dengan standar global.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-green-100 p-2 rounded-full">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Misi</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>
                      Menyediakan layanan berkualitas dengan standar pabrikan
                      Volkswagen
                    </li>
                    <li>
                      Menggunakan teknisi bersertifikat dan sparepart original
                    </li>
                    <li>
                      Memberikan pengalaman servis yang transparan dan terpercaya
                    </li>
                    <li>
                      Mengutamakan kepuasan pelanggan dengan layanan purna jual
                      terbaik
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow flex items-start">
                <div className="flex-shrink-0 mt-1 text-blue-600">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="ml-3 text-gray-700 font-medium">
                  Teknisi bersertifikat Volkswagen
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow flex items-start">
                <div className="flex-shrink-0 mt-1 text-blue-600">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="ml-3 text-gray-700 font-medium">
                  Sparepart original 100%
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow flex items-start">
                <div className="flex-shrink-0 mt-1 text-blue-600">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="ml-3 text-gray-700 font-medium">
                  Garansi resmi pabrikan
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow flex items-start">
                <div className="flex-shrink-0 mt-1 text-blue-600">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="ml-3 text-gray-700 font-medium">
                  Fasilitas tunggu premium
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;