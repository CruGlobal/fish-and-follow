"use-client";
import { useEffect, useState } from "react";
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
      const res = await fetch("http://localhost:3000/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newResource),
      });
      if (!res.ok) throw new Error("Failed to add resource");
      const data = await res.json();
      setResources((prev) => [...(prev || []), data]); // Update list
      setTitle("");
      setUrl("");
      setDescription("");
    } catch (err) {
      console.error("Failed to add resource:", err);
    }
  };

  useEffect(() => {
    fetch("http://localhost:3000/resources")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch resources");
        return res.json();
      })
      .then((data) => setResources(data))
      .catch((err) => console.error("Error fetching resources:", err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
        <p className="mt-2 text-lg text-gray-600">Here are just a few ways you can grow in your personal relationship with God</p>
        <a href="/" className="inline-block mt-4 text-blue-600 hover:text-blue-800">
          ← Back to Contact Form
        </a>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{resource.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Learn More →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
