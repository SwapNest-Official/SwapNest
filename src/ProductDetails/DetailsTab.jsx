import { useTheme } from "../contexts/ThemeContext"

export default function Details({ listing }) {
   const { isDarkMode } = useTheme()
   // console.log(listing)
  
    return (
      <>
        <div className="grid grid-cols-2 gap-4">
          {(Object.entries(listing?.details || {})).map(([key, value], index) => (
            <div
              key={index}
              className="flex flex-col p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800"
            >
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                {key}
              </span>
              <span className="text-base font-medium text-gray-900 dark:text-white mt-1">
                {value}
              </span>
            </div>
          ))}
        </div>
      </>
    )
  }
  