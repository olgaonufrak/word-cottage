'use strict';
// Stable section/text IDs preserve progress when cards are added or reordered.
const stageThreeSections=[
  {id:'a3-personality',name:'Personality Traits',ukTitle:'риси характеру',raw:`personality|особистість; характер
kind|добрий / добра
friendly|привітний / привітна
honest|чесний / чесна
generous|щедрий / щедра
patient|терплячий / терпляча
polite|ввічливий / ввічлива
confident|упевнений / упевнена в собі
shy|сором’язливий / сором’язлива
brave|хоробрий / хоробра
calm|спокійний / спокійна
cheerful|життєрадісний / життєрадісна
optimistic|оптимістичний / оптимістична
pessimistic|песимістичний / песимістична
serious|серйозний / серйозна
creative|творчий / творча
curious|допитливий / допитлива
hard-working|працьовитий / працьовита
lazy|лінивий / лінива
reliable|надійний / надійна
responsible|відповідальний / відповідальна
independent|самостійний / самостійна
sensitive|чутливий / чутлива
stubborn|упертий / уперта
selfish|егоїстичний / егоїстична
jealous|ревнивий / ревнива; заздрісний / заздрісна
talkative|балакучий / балакуча
quiet|мовчазний / мовчазна
open-minded|відкритий / відкрита до нових думок
a sense of humour|почуття гумору`},
  {id:'a3-health',name:'Health and Medicine',ukTitle:'здоров’я та медицина',raw:`health|здоров’я
medicine|ліки; медицина
doctor|лікар / лікарка
nurse|медсестра / медбрат
patient|пацієнт / пацієнтка
hospital|лікарня
clinic|клініка; поліклініка
pharmacy|аптека
appointment|запис на прийом
check-up|медичний огляд
symptom|симптом
pain|біль
headache|головний біль
toothache|зубний біль
stomach ache|біль у животі
fever|гарячка; підвищена температура
cough|кашель; кашляти
sore throat|біль у горлі
a cold|застуда
flu|грип
allergy|алергія
injury|травма
wound|рана
bandage|бинт; пов’язка
prescription|рецепт лікаря
tablet|таблетка
treatment|лікування
recover|одужувати
I feel unwell|я погано почуваюся
I need a doctor|мені потрібен лікар`},
  {id:'a3-household-items',name:'Household Items',ukTitle:'побутові речі',raw:`household item|побутова річ
towel|рушник
bed sheet|простирадло
blanket|ковдра
pillow|подушка
pillowcase|наволочка
duvet|пухова або стьобана ковдра
duvet cover|підковдра
curtain|штора
blinds|жалюзі
doormat|килимок біля дверей
mirror|дзеркало
coat hanger|вішак для одягу
laundry basket|кошик для білизни
storage box|коробка для зберігання
bin|смітник; відро для сміття
bin bag|пакет для сміття
key|ключ
key ring|кільце для ключів
lock|замок (на дверях)
candle|свічка
candle holder|підсвічник
vase|ваза
picture frame|рамка для фотографії або картини
clock|годинник (настінний або настільний)
battery|батарейка; акумулятор
extension lead|електричний подовжувач
light bulb|лампочка
socket|розетка
plug|електрична вилка`},
  {id:'a3-appliances',name:'Household Appliances',ukTitle:'побутова техніка',raw:`appliance|побутовий прилад
fridge|холодильник
freezer|морозильна камера
washing machine|пральна машина
tumble dryer|сушильна машина
dishwasher|посудомийна машина
vacuum cleaner|пилосос
robot vacuum|робот-пилосос
iron|праска
steam iron|парова праска
hair dryer|фен
electric kettle|електрочайник
toaster|тостер
microwave|мікрохвильова піч
oven|духовка
cooker|кухонна плита
hob|варильна поверхня
extractor fan|витяжка
blender|блендер
food processor|кухонний комбайн
mixer|міксер
coffee maker|кавоварка
air fryer|аерофритюрниця
fan|вентилятор
air conditioner|кондиціонер
heater|обігрівач
humidifier|зволожувач повітря
remote control|пульт дистанційного керування
power button|кнопка живлення
energy-saving|енергоощадний`},
  {id:'a3-cleaning',name:'Cleaning',ukTitle:'прибирання',raw:`cleaning|прибирання
tidy up|прибирати; наводити лад
clean|чистити; прибирати
dust|витирати пил; пил
sweep|підмітати
mop the floor|мити підлогу шваброю
vacuum|пилососити
wipe|витирати
scrub|відтирати; чистити щіткою
rinse|полоскати; споліскувати
wash the dishes|мити посуд
do the laundry|прати білизну
hang out the washing|розвішувати випрану білизну
fold the clothes|складати одяг
iron the clothes|прасувати одяг
take out the rubbish|виносити сміття
make the bed|застеляти ліжко
broom|віник; мітла
dustpan|совок для сміття
mop|швабра
bucket|відро
sponge|губка
cleaning cloth|ганчірка для прибирання
rubber gloves|гумові рукавички
detergent|мийний або пральний засіб
washing powder|пральний порошок
washing-up liquid|засіб для миття посуду
stain|пляма
mess|безлад
spotless|бездоганно чистий`},
  {id:'a3-cooking',name:'Cooking',ukTitle:'приготування їжі',raw:`cook|готувати їжу
recipe|рецепт страви
ingredient|інгредієнт
chop|нарізати; рубати
slice|нарізати скибками
dice|нарізати кубиками
peel|чистити від шкірки
grate|терти на тертці
stir|помішувати
mix|змішувати
whisk|збивати вінчиком
pour|наливати
add|додавати
measure|відмірювати
weigh|зважувати
boil|кип’ятити; варити
simmer|варити на слабкому вогні
fry|смажити
bake|випікати; запікати
roast|запікати м’ясо або овочі
grill|смажити на грилі
steam|готувати на парі
heat|нагрівати
preheat the oven|розігрівати духовку заздалегідь
season|приправляти
marinate|маринувати
defrost|розморожувати
serve|подавати до столу
burnt|підгорілий
homemade|домашнього приготування`},
  {id:'a3-kitchen-utensils',name:'Kitchen Utensils',ukTitle:'кухонне приладдя',raw:`utensil|кухонний інструмент; приладдя
knife|ніж
fork|виделка
spoon|ложка
teaspoon|чайна ложка
tablespoon|столова ложка
plate|тарілка
bowl|миска
cup|чашка
mug|горнятко; велика чашка
glass|склянка
jug|глечик
saucepan|каструля з довгою ручкою
frying pan|сковорода
lid|кришка
baking tray|деко
chopping board|дошка для нарізання
grater|тертка
peeler|овочечистка
colander|друшляк
sieve|сито
whisk|вінчик
spatula|кухонна лопатка
ladle|ополоник
tongs|кухонні щипці
rolling pin|качалка
measuring cup|мірна чашка
kitchen scales|кухонні ваги
can opener|консервний ніж
bottle opener|відкривачка для пляшок`},
  {id:'a3-travel',name:'Travel',ukTitle:'подорожі',raw:`travel|подорожувати; подорожі
trip|поїздка
journey|подорож; дорога з одного місця до іншого
destination|місце призначення
route|маршрут
traveller|мандрівник / мандрівниця
passenger|пасажир / пасажирка
passport|паспорт
visa|віза
ticket|квиток
single ticket|квиток в один бік
return ticket|квиток туди й назад
booking|бронювання
luggage|багаж
suitcase|валіза
backpack|рюкзак
pack|пакувати речі
unpack|розпаковувати речі
travel insurance|страхування для подорожі
border|кордон
customs|митниця
currency|валюта
exchange rate|обмінний курс
travel guide|путівник
travel agency|туристична агенція
go abroad|їхати за кордон
public transport|громадський транспорт
rent a car|орендувати автомобіль
get lost|заблукати
have a safe trip|щасливої та безпечної подорожі`},
  {id:'a3-airport',name:'Airport and Air Travel',ukTitle:'аеропорт і авіаподорожі',raw:`airport|аеропорт
flight|рейс; політ
airline|авіакомпанія
plane|літак
terminal|термінал аеропорту
check-in desk|стійка реєстрації
boarding pass|посадковий талон
departure|відправлення; виліт
arrival|прибуття
gate|вихід на посадку
boarding|посадка в літак
take off|злітати
land|приземлятися
runway|злітно-посадкова смуга
security check|перевірка безпеки
passport control|паспортний контроль
hand luggage|ручна поклажа
checked baggage|зареєстрований багаж
baggage reclaim|зона отримання багажу
seat belt|ремінь безпеки
window seat|місце біля вікна
aisle seat|місце біля проходу
overhead locker|багажна полиця над сидіннями
cabin crew|бортпровідники
pilot|пілот / пілотка
connecting flight|стикувальний рейс
layover|пересадка з очікуванням між рейсами
delayed|затриманий (про рейс)
cancelled|скасований
Where is my gate?|де мій вихід на посадку?`},
  {id:'a3-hotel',name:'Hotel',ukTitle:'готель',raw:`hotel|готель
reception|стійка реєстрації; рецепція
receptionist|адміністратор / адміністраторка
guest|гість / гостя
reservation|бронювання
check in|реєструватися в готелі
check out|виїжджати з готелю; оформляти виїзд
single room|одномісний номер
double room|номер із двоспальним ліжком
twin room|номер із двома окремими ліжками
key card|картка-ключ
room number|номер кімнати
lift|ліфт
stairs|сходи
corridor|коридор
private bathroom|власна ванна кімната
shower|душ
balcony|балкон
air conditioning|кондиціонування повітря
room service|обслуговування в номері
housekeeping|прибирання номерів
breakfast included|сніданок включено
Wi-Fi password|пароль до вайфаю
deposit|застава; завдаток
bill|рахунок
extra charge|додаткова плата
vacancy|вільний номер
fully booked|усі номери заброньовані
I have a reservation|у мене є бронювання
What time is check-out?|о котрій потрібно звільнити номер?`},
  {id:'a3-tourism',name:'Holidays and Tourism',ukTitle:'відпустка та туризм',raw:`holiday|відпустка; канікули
tourism|туризм
tourist|турист / туристка
sightseeing|огляд визначних місць
sight|визначне місце
landmark|пам’ятка; упізнаваний об’єкт
guided tour|екскурсія з гідом
tour guide|екскурсовод / екскурсоводка
excursion|екскурсія
museum|музей
gallery|галерея
monument|пам’ятник
castle|замок (будівля)
palace|палац
old town|старе місто
beach|пляж
resort|курорт
island|острів
coast|узбережжя
campsite|кемпінг; місце для наметів
tent|намет
souvenir|сувенір
postcard|листівка
local food|місцева їжа
entrance fee|плата за вхід
opening hours|години роботи
take photos|фотографувати
go hiking|ходити в піші походи
go camping|відпочивати з наметами
package holiday|пакетний тур`},
  {id:'a3-future',name:'Plans and the Future',ukTitle:'плани та майбутнє',raw:`future|майбутнє
plan|план; планувати
goal|мета
dream|мрія; мріяти
hope|надія; сподіватися
intention|намір
decision|рішення
opportunity|можливість
arrangement|домовленість
schedule|розклад; планувати за часом
deadline|кінцевий термін
priority|пріоритет
next week|наступного тижня
next month|наступного місяця
next year|наступного року
soon|скоро
later|пізніше
in a few days|за кілька днів
one day|колись; одного дня
in the future|у майбутньому
make plans|будувати плани
set a goal|поставити мету
make a decision|ухвалити рішення
change my mind|змінити свою думку
I'm going to travel|я збираюся подорожувати
I hope to visit you|я сподіваюся відвідати тебе
I'd like to learn more|я хотів би / хотіла б дізнатися більше
I'll call you tomorrow|я зателефоную тобі завтра
What are your plans?|які в тебе плани?
let's arrange a meeting|домовмося про зустріч`},
  {id:'a3-music',name:'Music',ukTitle:'музика',raw:`music|музика
song|пісня
singer|співак / співачка
band|музичний гурт
musician|музикант / музикантка
composer|композитор / композиторка
concert|концерт
live music|жива музика
stage|сцена
audience|публіка; глядачі
album|музичний альбом
track|музичний трек
playlist|список відтворення
lyrics|слова пісні
melody|мелодія
rhythm|ритм
beat|ритмічний удар; пульс музики
volume|гучність
headphones|навушники
speaker|динамік; колонка
guitar|гітара
piano|піаніно; фортепіано
violin|скрипка
drums|ударні інструменти; барабани
flute|флейта
classical music|класична музика
pop music|попмузика
rock music|рок-музика
sing along|підспівувати
play an instrument|грати на музичному інструменті`},
  {id:'a3-movies',name:'Movies and Television',ukTitle:'кіно та телебачення',raw:`film|фільм
movie|фільм (переважно американська англійська)
cinema|кінотеатр; кінематограф
television|телебачення; телевізор
TV series|телесеріал
episode|епізод; серія
season|сезон серіалу
actor|актор
actress|акторка
director|режисер / режисерка
character|персонаж
plot|сюжет
scene|сцена; епізод фільму
script|сценарій
trailer|трейлер; анонс фільму
subtitles|субтитри
dubbed|дубльований
comedy|комедія
drama|драма
thriller|трилер
horror film|фільм жахів
science fiction|наукова фантастика
documentary|документальний фільм
animation|анімація
cartoon|мультфільм
reality show|реаліті-шоу
news programme|програма новин
channel|телеканал
streaming service|стримінговий сервіс
What is it about?|про що цей фільм або серіал?`},
  {id:'a3-reading',name:'Books and Reading',ukTitle:'книжки та читання',raw:`book|книжка
reading|читання
reader|читач / читачка
author|автор / авторка
writer|письменник / письменниця
novel|роман
short story|коротке оповідання
poem|вірш
poetry|поезія
fairy tale|казка
biography|біографія
fiction|художня література
non-fiction|документальна та пізнавальна література
mystery novel|детективний роман
chapter|розділ книжки
page|сторінка
cover|обкладинка
title|назва книжки
contents|зміст (перелік розділів)
bookmark|закладка
library|бібліотека
bookshop|книгарня
e-book|електронна книжка
audiobook|аудіокнижка
edition|видання
publisher|видавець; видавництво
borrow a book|позичити книжку
return a book|повернути книжку
read aloud|читати вголос
turn the page|перегорнути сторінку`},
  {id:'a3-traditions',name:'Holidays and Traditions',ukTitle:'свята та традиції',raw:`celebration|святкування
tradition|традиція
custom|звичай
public holiday|державне свято; офіційний вихідний
New Year's Day|Новий рік (перший день року)
New Year's Eve|переддень Нового року
Christmas|Різдво
Christmas Eve|Святий вечір; переддень Різдва
Easter|Великдень
birthday|день народження
anniversary|річниця
wedding|весілля
festival|фестиваль
parade|парад
ceremony|церемонія
invitation|запрошення
invite|запрошувати
host|господар / господиня свята
guest|гість / гостя
gift|подарунок
greeting card|вітальна листівка
decoration|прикраса
candle|свічка
fireworks|феєрверк
costume|святковий або маскарадний костюм
family gathering|сімейна зустріч
celebrate|святкувати
make a wish|загадати бажання
give a present|подарувати подарунок
Happy birthday!|з днем народження!`},
  {id:'a3-technology',name:'Computers and Technology',ukTitle:'комп’ютери та технології',raw:`computer|комп’ютер
laptop|ноутбук
tablet|планшет
smartphone|смартфон
keyboard|клавіатура
mouse|комп’ютерна миша
screen|екран
monitor|монітор
printer|принтер
scanner|сканер
charger|зарядний пристрій
USB cable|кабель USB
hard drive|жорсткий диск
memory|пам’ять пристрою
file|файл
folder|папка
software|програмне забезпечення
hardware|апаратне забезпечення
operating system|операційна система
app|застосунок
update|оновлення; оновлювати
install|встановлювати програму
uninstall|видаляти програму
save a file|зберегти файл
delete a file|видалити файл
copy|копіювати; копія
paste|вставляти
backup|резервна копія
restart|перезапускати
touchscreen|сенсорний екран`},
  {id:'a3-internet',name:'Internet and Social Media',ukTitle:'інтернет і соціальні мережі',raw:`internet|інтернет
website|вебсайт
web page|вебсторінка
browser|браузер
search engine|пошукова система
link|посилання
account|обліковий запис
username|ім’я користувача
password|пароль
log in|увійти в обліковий запис
log out|вийти з облікового запису
sign up|зареєструватися
download|завантажувати на свій пристрій
upload|завантажувати з пристрою в мережу
online|онлайн; у мережі
offline|офлайн; без підключення до мережі
social media|соціальні мережі
profile|профіль
post|допис; публікувати допис
comment|коментар; коментувати
like|вподобайка; вподобати
share|поширювати
follow|стежити за сторінкою; підписатися
follower|підписник / підписниця
message|повідомлення
notification|сповіщення
video call|відеодзвінок
privacy settings|налаштування приватності
spam|спам; небажані повідомлення
connection|з’єднання; підключення`},
  {id:'a3-safety',name:'Safety and Emergencies',ukTitle:'безпека та надзвичайні ситуації',raw:`safety|безпека
danger|небезпека
emergency|надзвичайна ситуація
accident|нещасний випадок; аварія
fire|пожежа; вогонь
smoke|дим
alarm|сигнал тривоги; сигналізація
fire alarm|пожежна сигналізація
smoke detector|датчик диму
fire extinguisher|вогнегасник
emergency exit|аварійний вихід
evacuation|евакуація
shelter|укриття
ambulance|машина швидкої допомоги
police|поліція
firefighter|пожежник / пожежниця
rescue|порятунок; рятувати
first aid|перша допомога
first-aid kit|аптечка
warning|попередження
safe|безпечний
unsafe|небезпечний
injured|травмований / травмована
missing|зниклий / зникла
theft|крадіжка
report an accident|повідомити про аварію
call for help|покликати на допомогу
call an ambulance|викликати швидку допомогу
stay calm|зберігати спокій
keep away|триматися подалі`},
  {id:'a3-roads',name:'Roads and Navigation',ukTitle:'дороги та навігація',raw:`road|дорога
street|вулиця
motorway|автомагістраль
lane|смуга руху
junction|перехрестя; місце з’єднання доріг
crossroads|перехрестя
roundabout|кругове перехрестя
traffic lights|світлофор
pedestrian crossing|пішохідний перехід
pavement|тротуар (британська англійська)
bridge|міст
tunnel|тунель
road sign|дорожній знак
speed limit|обмеження швидкості
traffic jam|затор
roadworks|дорожні роботи
detour|об’їзд
one-way street|вулиця з одностороннім рухом
dead end|тупик
car park|автостоянка
petrol station|автозаправна станція
map|мапа; карта
navigation|навігація
GPS|система супутникової навігації
turn left|повернути ліворуч
turn right|повернути праворуч
go straight ahead|іти або їхати прямо
take the next exit|скористатися наступним з’їздом
cross the road|перейти дорогу
follow the signs|рухатися за вказівниками`},
  {id:'a3-birds',name:'Birds',ukTitle:'птахи',raw:`bird|птах
sparrow|горобець
pigeon|голуб
dove|голуб; горлиця
crow|ворона
raven|крук
magpie|сорока
swallow|ластівка
robin|вільшанка
blackbird|чорний дрізд
starling|шпак
nightingale|соловей
woodpecker|дятел
owl|сова
eagle|орел
hawk|яструб
falcon|сокіл
seagull|чайка
swan|лебідь
duck|качка
goose|гуска
stork|лелека
heron|чапля
parrot|папуга
penguin|пінгвін
ostrich|страус
wing|крило
feather|перо; пір’їна
beak|дзьоб
nest|гніздо`},
  {id:'a3-plants',name:'Plants and Flowers',ukTitle:'рослини та квіти',raw:`plant|рослина; садити
flower|квітка
tree|дерево
bush|кущ
grass|трава
leaf|листок
root|корінь
stem|стебло
branch|гілка
seed|насінина; насіння
bud|брунька; пуп’янок
petal|пелюстка
soil|ґрунт
flowerpot|квітковий горщик
rose|троянда
tulip|тюльпан
daisy|стокротка; маргаритка
sunflower|соняшник
lily|лілія
daffodil|нарцис
orchid|орхідея
poppy|мак
lavender|лаванда
oak|дуб
pine|сосна
birch|береза
maple|клен
grow|рости; вирощувати
bloom|цвісти
water the plants|поливати рослини`},
  {id:'a3-insects',name:'Insects',ukTitle:'комахи',raw:`insect|комаха
ant|мураха
bee|бджола
bumblebee|джміль
wasp|оса
hornet|шершень
butterfly|метелик
moth|нічний метелик; міль
caterpillar|гусінь; гусениця
beetle|жук
ladybird|сонечко (комаха)
fly|муха
mosquito|комар
dragonfly|бабка (комаха)
grasshopper|коник-стрибунець
cricket|цвіркун
cockroach|тарган
flea|блоха
louse|воша
termite|терміт
firefly|світляк
mantis|богомол
antenna|вусик комахи
wing|крило
larva|личинка
cocoon|кокон
hive|вулик
swarm|рій
buzz|дзижчати; дзижчання
sting|жалити; жало`},
  {id:'a3-phrasal-verbs',name:'Phrasal Verbs',ukTitle:'фразові дієслова',raw:`get up|вставати з ліжка
wake up|прокидатися
go out|виходити; іти кудись розважитися
come back|повертатися
get on|сідати в автобус, потяг або літак
get off|виходити з автобуса, потяга або літака
get in|сідати в автомобіль
get out|виходити з автомобіля
turn on|вмикати
turn off|вимикати
turn up|збільшувати гучність
turn down|зменшувати гучність
put on|одягати
take off|знімати одяг або взуття
try on|приміряти
look for|шукати
look after|доглядати за
look up|шукати інформацію у словнику чи довіднику
find out|дізнаватися; з’ясовувати
give up|здаватися; відмовлятися від звички
pick up|підбирати; забирати когось
put away|прибирати на місце
throw away|викидати
run out of|вичерпати запас чогось
break down|ламатися (про машину або техніку)
carry on|продовжувати
set off|вирушати в дорогу
fill in|заповнювати форму
get along with|ладнати з
work out|розв’язувати проблему; тренуватися`},
  {id:'a3-problems',name:'Problems and Solutions',ukTitle:'проблеми та рішення',raw:`problem|проблема
solution|розв’язання; вирішення
issue|питання; проблема
difficulty|трудність
challenge|виклик; складне завдання
mistake|помилка
error|помилка; збій
fault|несправність; провина
cause|причина; спричиняти
reason|причина; підстава
consequence|наслідок
result|результат
option|варіант
advice|порада; поради
suggestion|пропозиція
support|підтримка; підтримувати
solve|розв’язувати
fix|виправляти; лагодити
repair|ремонтувати
deal with|мати справу з; вирішувати
avoid|уникати
prevent|запобігати
improve|покращувати
check|перевіряти
try again|спробувати ще раз
ask for help|попросити допомоги
What's wrong?|що сталося?; що не так?
It doesn't work|це не працює
There must be a solution|має бути якесь рішення
Let's find a way|знайдімо спосіб`}
];
for(const [index,section] of stageThreeSections.entries()){
  categories.push({id:section.id,name:section.name,en:section.name,ukTitle:section.ukTitle,stage:3,color:'olive',note:section.ukTitle,tile:['0% 0%','66.66% 14.28%','33.33% 0%','0% 42.85%'][index%4]});
  for(const line of section.raw.split('\n')){
    const [en,uk]=line.split('|');
    words.push({id:section.id+'-'+encodeURIComponent(en.toLowerCase()),en,uk,category:section.id});
  }
}
