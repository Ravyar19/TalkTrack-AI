// ActionItems.jsx - Remove the extractActionItems function since we're getting items from the API
export default function ActionItems({ actionItems = [] }) {
  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Action Items</h2>
      <ul className="space-y-2">
        {actionItems && actionItems.length > 0 ? (
          actionItems.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <input type="checkbox" className="form-checkbox" />
              <span>{item.text}</span>
              {item.assignee && (
                <span className="text-blue-500">@{item.assignee}</span>
              )}
              {item.deadline && (
                <span className="text-gray-500">({item.deadline})</span>
              )}
            </li>
          ))
        ) : (
          <li className="text-gray-500">No action items yet</li>
        )}
      </ul>
    </div>
  );
}
