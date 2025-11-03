// components/onboarding/Step3_Preferences.jsx — Light Theme
import React from "react";

const availableInterests = ["Hiking","Cooking","Photography","Travel","Movies","Gaming","Reading"];

const Step3_Preferences = ({ formData, updateFormData }) => {
  React.useEffect(() => {
    if (!formData.preferences) {
      updateFormData({
        ...formData,
        preferences: {
          interestedIn: [],
          relationshipIntent: "",
          sexualOrientation: "",
          interests: [],
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePreferenceSelect = (key, value) => {
    const cur = formData.preferences[key];
    let next;
    if (key === "interestedIn") {
      if (cur.includes("Everyone")) next = [value];
      else if (value === "Everyone") next = ["Everyone"];
      else if (cur.includes(value)) next = cur.filter((v) => v !== value);
      else next = [...cur, value].filter((v) => v !== "Everyone");
    } else {
      next = cur === value ? "" : value;
    }
    updateFormData({ ...formData, preferences: { ...formData.preferences, [key]: next } });
  };

  const handleInterestToggle = (interest) => {
    const cur = formData.preferences.interests || [];
    const next = cur.includes(interest) ? cur.filter((i) => i !== interest) : [...cur, interest];
    updateFormData({ ...formData, preferences: { ...formData.preferences, interests: next } });
  };

  const chipClass = (key, value) => {
    const selected = Array.isArray(formData.preferences[key])
      ? formData.preferences[key].includes(value)
      : formData.preferences[key] === value;
    return `px-4 py-2 rounded-full font-semibold transition-colors border ${
      selected ? "bg-pink-600 text-white border-pink-600" : "bg-white text-pink-600 border-pink-600 hover:bg-pink-50"
    }`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 max-w-6xl w-full">
      {/* LEFT */}
      <section className="col-span-1 space-y-10">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-1 text-black">Your Matching Preferences</h2>
        <p className="text-gray-700">Tell us what you're looking for so we can suggest compatible connections.</p>

        {/* Interested In */}
        <div className="space-y-3">
          <label className="block text-black text-base font-semibold">I'm interested in:</label>
          <div className="flex flex-wrap gap-3">
            {["Men","Women","Everyone"].map((v) => (
              <button key={v} type="button" onClick={() => handlePreferenceSelect("interestedIn", v)} className={chipClass("interestedIn", v)}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Relationship Intent */}
        <div className="space-y-3">
          <label className="block text-black text-base font-semibold">I'm looking for:</label>
          <div className="flex flex-wrap gap-3">
            {["Long-term","Casual","Friendship"].map((v) => (
              <button key={v} type="button" onClick={() => handlePreferenceSelect("relationshipIntent", v)} className={chipClass("relationshipIntent", v)}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Sexual Orientation */}
        <div className="space-y-3">
          <label className="block text-black text-base font-semibold">Sexual Orientation</label>
          <div className="flex flex-wrap gap-3">
            {["Straight","Gay","Bisexual","Other"].map((v) => (
              <button key={v} type="button" onClick={() => handlePreferenceSelect("sexualOrientation", v)} className={chipClass("sexualOrientation", v)}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-3">
          <label className="block text-black text-base font-semibold">My Top Interests</label>
          <div className="flex flex-wrap gap-2">
            {availableInterests.map((interest) => {
              const selected = formData.preferences?.interests?.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors border ${
                    selected ? "bg-yellow-50 text-black border-pink-300" : "bg-white text-gray-700 border-gray-200 hover:bg-pink-50"
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* RIGHT */}
      <aside className="col-span-1 hidden md:block pl-8 pt-2 border-l border-pink-100">
        <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-6">
          <h3 className="text-xl font-bold mb-3 text-black">Matching Insight</h3>
          <p className="text-gray-700 mb-4">More detail = fewer swipes and better matches.</p>

          <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
            <p className="font-semibold text-black">Looking For</p>
            <ul className="text-sm space-y-1 text-gray-700 mt-1">
              <li>Gender: <span className="font-medium text-black">{formData.preferences?.interestedIn?.join(", ") || "Any"}</span></li>
              <li>Intent: <span className="font-medium text-black">{formData.preferences?.relationshipIntent || "Not set"}</span></li>
              <li>Orientation: <span className="font-medium text-black">{formData.preferences?.sexualOrientation || "Not set"}</span></li>
              <li>Interests: <span className="font-medium text-black">{formData.preferences?.interests?.join(", ") || "None selected"}</span></li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Step3_Preferences;
