"use-client";
import { useEffect, useState } from "react"; // if not already imported
import axios from "axios"; // install with `npm install axios` if needed
import { PageHeaderCentered } from "../components/PageHeaderCentered";
import { InfoCardGrid } from "../components/InfoCardGrid";
import type { FormEvent } from "react";

type Resource = {
  id: number;
  title: string;
  url: string;
  description: string;
};

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const newResource = { title, url, description };
      const res = await axios.post(
        "http://localhost:3000/api/resources",
        newResource
      );
      setResources((prev) => [...(prev || []), res.data]); // Update list
      setTitle("");
      setUrl("");
      setDescription("");
    } catch (err) {
      console.error("Failed to add resource:", err);
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/resources") // Your backend endpoint
      .then((res) => setResources(res.data))
      .catch((err) => console.error("Error fetching resources:", err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHeaderCentered
        title="Resources"
        description="Here are just a few ways you can grow in your personal relationship with God"
        showBackButton
        backButtonText="Back to Contact Form"
        backButtonHref="/"
      />

      <InfoCardGrid title="All Resources" items={resources} />
    </div>
  );
}

// import { useState } from "react";
// import type { Route } from "./+types/resources";
// import { PageHeaderCentered } from "../components/PageHeaderCentered";
// import { InfoCardGrid } from "../components/InfoCardGrid";

// export function meta({}: Route.MetaArgs) {
//   return [
//     { title: "Resources - Fish and Follow" },
//     {
//       name: "description",
//       content: "Helpful resources and information to grow in your faith",
//     },
//   ];
// }

// const categories = [
//   "All",
//   "Documentation",
//   "Development",
//   "Guidelines",
//   "Support",
//   "Legal",
// ];

// export default function Resources() {
//   const featuredResources = resources;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <PageHeaderCentered
//           title="Resources"
//           description="Here are just a few ways you can grow in your personal relationship with God"
//           showBackButton
//           backButtonText="Back to Contact Form"
//           backButtonHref="/"
//         />

//         {/* Show featured resources only if "All" is selected or if there are featured resources in the filtered category */}
//         {featuredResources.length > 0 && (
//           <InfoCardGrid
//             title="Featured Resources"
//             items={featuredResources}
//             variant="featured"
//           />
//         )}
//       </div>
//     </div>
//   );
// }
