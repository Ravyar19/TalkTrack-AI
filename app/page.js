"use client";
export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">AI Meeting Assistant</h1>
      <div className="flex gap-4 mb-6">
        <button className="bg-green-500 text-white px-4 py-2 rounded">
          Start Meeting
        </button>
        <button className="bg-red-500 text-white px-4 py-2 rounded">
          End Meeting
        </button>
      </div>
      <div></div>
    </div>
  );
}
