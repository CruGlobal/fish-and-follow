import { InfoCard } from "./InfoCard";

interface InfoItem {
  id: number;
  title: string;
  description: string;
  url: string;
}

interface InfoCardGridProps {
  title: string;
  items: InfoItem[];
}

export function InfoCardGrid({ title, items }: InfoCardGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No items found
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Try selecting a different category or check back later.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <InfoCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
}
