export function meta() {
  return [
    { title: "QR Code" },
    { name: "description", content: "Submit your contact information" },
  ];
}

export default function QR() {
  const organization = "test";
  const imageUrl = `/api/qr/${organization}`
  return (
    <div className="min-h-screen app-bg py-12">
      <div className="mx-auto max-w-md">
        <div className="text-center items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-16">Share the Contact Form</h1>
          <img src={imageUrl} className="mx-auto h-* w-4/5 mb-16" />
          <a
            href={`${imageUrl}?download=1`}
            download="qr-code.png"
            className="inline-block px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Save QR
          </a>
        </div>
      </div>
    </div>
  );
}
