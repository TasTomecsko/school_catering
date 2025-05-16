import CalendarMealCard from "@/components/public/calendarMealCard";
import { getDatesOfWeek, getFormattedDateForPage, getMonday, getSunday } from "@/functions/dateHelperFunctions";
import { prisma } from "@/prisma";

export default async function Home() {
  const today = new Date();
  const currentMenu = await prisma.menu.findFirst({
    where: {
      startDate: {
        lte: today
      },
      endDate: {
        gte: today
      },
    },
    include: {
      meals: {
        where: {
          AND: [
            {
              dateOfMeal: {
                lte: getSunday()
              }
            },
            {
              dateOfMeal: {
                gte: getMonday()
              }
            }
          ]
        },
        select: {
          code: true,
          description: true,
          dateOfMeal: true
        }
      }
    }
  });

  var mealsOfWeek: {code: string, description: string}[][] = [[],[],[],[],[],[],[]];
  if (currentMenu) {
    currentMenu.meals.map((meal) => {
      var dayIndex = meal.dateOfMeal.getDay() == 0 ? 6 : meal.dateOfMeal.getDay() - 1;
      mealsOfWeek[dayIndex].push(meal);
    });
  }

  var longest: number = 0;
  mealsOfWeek.map((day) => {
    if(longest < day.length)
      longest = day.length;
  });

  var rowCount: number[] = [];
  for(var i = 0; i < longest; i++) {
    rowCount.push(i);
  }

  const dates: Date[] = getDatesOfWeek();

  return (
    <div>
      <div className="pl-2.5 mb-8">
        <h1 className="text-2xl font-medium py-2">Heti menü</h1>
      </div>
      {(currentMenu) && <div className="overflow-x-auto">
        <table className="table-fixed min-w-[1024px]">
          <thead className="bg-gray-200">
            <tr className="text-lg">
              <th className="font-thin w-1/7">Hétfő<br />{getFormattedDateForPage(dates[0])}</th>
              <th className="font-thin w-1/7">Kedd<br />{getFormattedDateForPage(dates[1])}</th>
              <th className="font-thin w-1/7">Szerda<br />{getFormattedDateForPage(dates[2])}</th>
              <th className="font-thin w-1/7">Csütörtök<br />{getFormattedDateForPage(dates[3])}</th>
              <th className="font-thin w-1/7">Péntek<br />{getFormattedDateForPage(dates[4])}</th>
              <th className="font-thin w-1/7">Szombat<br />{getFormattedDateForPage(dates[5])}</th>
              <th className="font-thin w-1/7">Vasárnap<br />{getFormattedDateForPage(dates[6])}</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {rowCount.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {mealsOfWeek.map((dayOfWeek, dayIndex) => (
                  <td key={dayIndex} className="border w-1/7">
                    {dayOfWeek[row] ? (
                      <CalendarMealCard
                        code={dayOfWeek[row].code}
                        description={dayOfWeek[row].description}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
      {(!currentMenu) && <div className="text-xl text-center font-medium">
        Jelenleg nincsen elérhető menü
      </div>}
    </div>
  );
}
