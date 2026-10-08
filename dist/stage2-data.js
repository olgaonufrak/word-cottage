'use strict';
// Stable section/text IDs preserve progress when cards are added or reordered.
const stageTwoSections=[
  {id:'a2-prepositions',name:'Prepositions',ukTitle:'прийменники',raw:`in|у; в
on|на
at|біля; у (про місце або час)
under|під
over|над
above|вище; над
below|нижче; під
behind|позаду
in front of|перед
next to|поруч із
between|між (двома)
among|серед
near|біля; поблизу
opposite|навпроти
inside|усередині
outside|зовні; за межами
into|у; всередину
out of|з; ізсередини
through|через; крізь
across|через; на інший бік
along|уздовж
around|навколо
to|до
from|з; від
with|з; разом із
without|без
for|для; протягом
about|про
before|перед; до
after|після`},
  {id:'a2-conjunctions',name:'Conjunctions',ukTitle:'сполучники',raw:`and|і; та
but|але
or|або
because|тому що
so|тому; отже
if|якщо
when|коли
while|поки; тоді як
although|хоча
though|хоча
unless|якщо не
until|доки не
before|перед тим як
after|після того як
since|відтоді як; оскільки
as|коли; оскільки
whether|чи
that|що
both ... and|і ... і
either ... or|або ... або
neither ... nor|ні ... ні
not only ... but also|не лише ... а й`},
  {id:'a2-body',name:'Parts of the Body',ukTitle:'частини тіла',raw:`body|тіло
head|голова
face|обличчя
hair|волосся
forehead|лоб
eye|око
ear|вухо
nose|ніс
mouth|рот
lip|губа
tooth|зуб
teeth|зуби
tongue|язик
cheek|щока
chin|підборіддя
neck|шия
shoulder|плече
arm|рука (від плеча до кисті)
elbow|лікоть
hand|кисть руки
finger|палець руки
thumb|великий палець руки
chest|груди
back|спина
stomach|живіт; шлунок
leg|нога
knee|коліно
foot|стопа
feet|стопи
toe|палець ноги`},
  {id:'a2-emotions',name:'Emotions and Feelings',ukTitle:'емоції та почуття',raw:`feeling|почуття
emotion|емоція
happiness|щастя
sadness|смуток
anger|гнів
fear|страх
love|любов
hope|надія
surprise|здивування
happy|щасливий
sad|сумний
angry|сердитий
afraid|наляканий
worried|стурбований
excited|схвильований від радості
bored|знуджений
calm|спокійний
nervous|нервовий; схвильований
lonely|самотній
proud|гордий
shy|сором'язливий
surprised|здивований
disappointed|розчарований
relaxed|розслаблений
grateful|вдячний
embarrassed|зніяковілий`},
  {id:'a2-people-communication',name:'Communication with People',ukTitle:'спілкування з людьми',raw:`conversation|розмова
question|запитання
answer|відповідь
opinion|думка; погляд
advice|порада
information|інформація
news|новини
message|повідомлення
talk|розмовляти
speak|говорити
say|сказати
tell|розповідати; сказати комусь
ask|запитувати
answer a question|відповідати на запитання
listen|слухати
hear|чути
explain|пояснювати
repeat|повторювати
agree|погоджуватися
disagree|не погоджуватися
introduce|представляти; знайомити
invite|запрошувати
discuss|обговорювати
understand|розуміти
keep in touch|підтримувати зв'язок`},
  {id:'a2-requests',name:'Requests and Apologies',ukTitle:'прохання та вибачення',raw:`please|будь ласка
excuse me|перепрошую
I'm sorry|вибачте; мені шкода
I apologize|я перепрошую
sorry I'm late|вибачте, що запізнився / запізнилася
it was my fault|це була моя провина
I didn't mean to|я не хотів / хотіла цього
that's all right|усе гаразд
don't worry about it|не переймайся цим
never mind|нічого страшного; не зважай
could you help me?|чи могли б ви мені допомогти?
can I ask you something?|можна вас дещо запитати?
could you repeat that?|чи могли б ви це повторити?
please speak more slowly|будь ласка, говоріть повільніше
could you wait a moment?|чи могли б ви трохи зачекати?
may I come in?|можна увійти?
may I sit here?|можна тут сісти?
can I borrow your pen?|можна позичити вашу ручку?
could you open the window?|чи могли б ви відчинити вікно?
please close the door|будь ласка, зачиніть двері
I'd like some help|я хотів би / хотіла б отримати допомогу
thank you for your patience|дякую за ваше терпіння`},
  {id:'a2-city',name:'City',ukTitle:'місто',raw:`city|місто (велике)
town|місто (невелике)
village|село
capital|столиця
city centre|центр міста
street|вулиця
road|дорога
avenue|проспект
square|площа
neighbourhood|район; околиця
suburb|передмістя
district|район
address|адреса
postcode|поштовий індекс
pavement|тротуар (британська англійська)
sidewalk|тротуар (американська англійська)
crossing|перехід
traffic lights|світлофор
traffic|дорожній рух
bridge|міст
park|парк
car park|автостоянка
bus stop|автобусна зупинка
crowd|натовп`},
  {id:'a2-buildings',name:'Buildings and Places',ukTitle:'будівлі та місця',raw:`building|будівля
entrance|вхід
exit|вихід
floor|поверх; підлога
lift|ліфт (британська англійська)
stairs|сходи
hospital|лікарня
pharmacy|аптека
bank|банк
post office|пошта
police station|поліцейський відділок
fire station|пожежна частина
library|бібліотека
museum|музей
cinema|кінотеатр
theatre|театр
hotel|готель
restaurant|ресторан
café|кафе
supermarket|супермаркет
shopping centre|торговельний центр
school|школа
university|університет
station|станція; вокзал
airport|аеропорт
church|церква
playground|дитячий майданчик
swimming pool|басейн`},
  {id:'a2-directions',name:'Directions and Locations',ukTitle:'напрямки та розташування',raw:`left|ліворуч; лівий
right|праворуч; правий
straight ahead|прямо вперед
turn left|поверніть ліворуч
turn right|поверніть праворуч
go straight|йдіть прямо
go past|пройдіть повз
cross the road|перейдіть дорогу
on the left|ліворуч
on the right|праворуч
at the corner|на розі
around the corner|за рогом
at the end of the street|у кінці вулиці
next to the bank|поруч із банком
opposite the station|навпроти вокзалу
near here|неподалік звідси
far away|далеко
upstairs|нагорі (на вищому поверсі)
downstairs|унизу (на нижчому поверсі)
north|північ
south|південь
east|схід
west|захід
map|карта; мапа
location|розташування; місцезнаходження
where is the nearest bus stop?|де найближча автобусна зупинка?`},
  {id:'a2-transport',name:'Transportation',ukTitle:'транспорт',raw:`transport|транспорт
car|автомобіль
bus|автобус
train|поїзд
tram|трамвай
underground|метро (британська англійська)
subway|метро (американська англійська)
taxi|таксі
bicycle|велосипед
motorbike|мотоцикл
plane|літак
boat|човен
ship|корабель
ticket|квиток
return ticket|квиток в обидва боки
single ticket|квиток в один бік
timetable|розклад
platform|платформа
passenger|пасажир
driver|водій
journey|поїздка
delay|затримка
departure|відправлення
arrival|прибуття
get on|сідати (у автобус або поїзд)
get off|виходити (з автобуса або поїзда)
catch a bus|встигнути на автобус
miss a train|не встигнути на поїзд`},
  {id:'a2-shopping',name:'Shopping',ukTitle:'покупки',raw:`shopping|покупки; похід по магазинах
shopping list|список покупок
shopping bag|сумка для покупок
basket|кошик
trolley|візок для покупок
price|ціна
discount|знижка
sale|розпродаж
offer|пропозиція
size|розмір
customer|покупець; клієнт
shop assistant|продавець-консультант
buy|купувати
sell|продавати
choose|обирати
try on|приміряти
look for|шукати
return an item|повернути товар
exchange|обмінювати; обмін
in stock|у наявності
out of stock|немає в наявності
how much does it cost?|скільки це коштує?
I'm just looking|я лише дивлюся
do you have a smaller size?|чи є у вас менший розмір?
I'll take it|я це візьму`},
  {id:'a2-shops',name:'Shops and Stores',ukTitle:'магазини та крамниці',raw:`shop|магазин (британська англійська)
store|магазин (американська англійська)
supermarket|супермаркет
grocery store|продуктовий магазин
bakery|пекарня
butcher's|м'ясна крамниця
greengrocer's|овочева крамниця
bookshop|книгарня
clothes shop|магазин одягу
shoe shop|магазин взуття
pharmacy|аптека
department store|універмаг
shopping mall|торговельний центр
market|ринок
newsagent's|магазин газет і журналів
toy shop|магазин іграшок
pet shop|зоомагазин
electronics shop|магазин електроніки
florist's|квіткова крамниця
online shop|інтернет-магазин
checkout|каса
shelf|полиця
counter|прилавок
opening hours|години роботи`},
  {id:'a2-money',name:'Money and Payments',ukTitle:'гроші та оплата',raw:`money|гроші
cash|готівка
coin|монета
banknote|банкнота
change|решта; дрібні гроші
wallet|гаманець
bank account|банківський рахунок
bank card|банківська картка
credit card|кредитна картка
debit card|дебетова картка
payment|платіж; оплата
pay|платити
cost|коштувати; вартість
spend|витрачати
save money|заощаджувати гроші
borrow|позичати (брати в борг)
lend|позичати (давати в борг)
bill|рахунок до оплати
receipt|чек
refund|повернення грошей
tip|чайові
cash machine|банкомат
transfer|переказ грошей
contactless payment|безконтактна оплата
can I pay by card?|чи можна заплатити карткою?
keep the change|залиште решту собі`},
  {id:'a2-restaurants',name:'Restaurants and Cafés',ukTitle:'ресторани та кафе',raw:`restaurant|ресторан
café|кафе
coffee shop|кав'ярня
table|стіл
menu|меню
waiter|офіціант
waitress|офіціантка
chef|шеф-кухар
customer|відвідувач; клієнт
reservation|бронювання
breakfast|сніданок
lunch|обід
dinner|вечеря
starter|закуска; перша страва
main course|основна страва
dessert|десерт
drink|напій
plate|тарілка
bowl|миска
fork|виделка
knife|ніж
spoon|ложка
napkin|серветка
bill|рахунок
service|обслуговування
a table for two|столик на двох`},
  {id:'a2-ordering-food',name:'Ordering Food',ukTitle:'замовлення їжі',raw:`order|замовляти; замовлення
I'd like a coffee, please|я хотів би / хотіла б каву, будь ласка
can I see the menu?|можна подивитися меню?
are you ready to order?|ви готові замовити?
what do you recommend?|що ви порадите?
I'll have the soup|я візьму суп
anything else?|ще щось?
that's all, thank you|це все, дякую
still water|негазована вода
sparkling water|газована вода
with milk|з молоком
without sugar|без цукру
vegetarian|вегетаріанський
vegan|веганський
spicy|гострий (про їжу)
gluten-free|без глютену
I'm allergic to nuts|у мене алергія на горіхи
does this contain milk?|чи є в цьому молоко?
to eat in|щоб поїсти тут (у закладі)
to take away|із собою (про їжу)
can we have the bill, please?|можна нам рахунок, будь ласка?
can we pay separately?|чи можна заплатити окремо?
the food is delicious|їжа дуже смачна
my order hasn't arrived|моє замовлення ще не принесли`},
  {id:'a2-education',name:'School and Education',ukTitle:'школа та освіта',raw:`school|школа
classroom|класна кімната
class|клас; заняття
lesson|урок
teacher|учитель; учителька
student|студент; учень
pupil|учень; учениця
classmate|однокласник; однокласниця
subject|навчальний предмет
homework|домашнє завдання
exam|іспит
test|тест; контрольна робота
mark|оцінка
mistake|помилка
question|запитання
answer|відповідь
learn|вивчати
study|навчатися; вивчати
teach|навчати
read|читати
write|писати
practise|практикуватися
English|англійська мова
maths|математика
history|історія
geography|географія
science|природничі науки
university|університет`},
  {id:'a2-stationery',name:'Stationery and School Supplies',ukTitle:'канцелярія та шкільне приладдя',raw:`pen|ручка
pencil|олівець
notebook|зошит
exercise book|шкільний зошит
textbook|підручник
dictionary|словник
paper|папір
sheet of paper|аркуш паперу
eraser|гумка
ruler|лінійка
pencil sharpener|точилка для олівців
pencil case|пенал
school bag|шкільна сумка
backpack|рюкзак
scissors|ножиці
glue|клей
marker|маркер
highlighter|текстовий маркер
coloured pencils|кольорові олівці
crayons|воскові олівці
folder|папка
calculator|калькулятор
whiteboard|маркерна дошка
chalk|крейда`},
  {id:'a2-jobs',name:'Jobs and Professions',ukTitle:'робота та професії',raw:`job|робота; посада
profession|професія
work|працювати; робота
office|офіс
company|компанія
colleague|колега
boss|керівник; керівниця
salary|заробітна плата
teacher|учитель; учителька
doctor|лікар; лікарка
nurse|медсестра; медбрат
dentist|стоматолог
engineer|інженер
driver|водій
shop assistant|продавець-консультант
waiter|офіціант
cook|кухар
police officer|поліцейський
firefighter|пожежник
farmer|фермер
builder|будівельник
electrician|електрик
hairdresser|перукар
accountant|бухгалтер
lawyer|юрист
manager|менеджер; керівник
programmer|програміст
artist|художник; художниця
journalist|журналіст
receptionist|працівник стійки реєстрації`},
  {id:'a2-hobbies',name:'Hobbies and Interests',ukTitle:'хобі та інтереси',raw:`hobby|хобі; захоплення
interest|інтерес
free time|вільний час
reading|читання
writing|письмо
drawing|малювання
painting|малювання фарбами
photography|фотографія
cooking|приготування їжі
baking|випікання
gardening|садівництво
knitting|в'язання
sewing|шиття
dancing|танці
singing|спів
listening to music|слухання музики
playing the guitar|гра на гітарі
watching films|перегляд фільмів
playing games|гра в ігри
travelling|подорожування
hiking|піші походи
camping|відпочинок із наметом
collecting|колекціонування
chess|шахи
what do you do in your free time?|що ти робиш у вільний час?`},
  {id:'a2-sports',name:'Sports',ukTitle:'спорт',raw:`sport|спорт
football|футбол
basketball|баскетбол
volleyball|волейбол
tennis|теніс
table tennis|настільний теніс
badminton|бадмінтон
swimming|плавання
running|біг
cycling|їзда на велосипеді
skiing|катання на лижах
skating|катання на ковзанах
yoga|йога
gym|спортзал
team|команда
player|гравець
coach|тренер
match|матч
competition|змагання
race|перегони; забіг
ball|м'яч
goal|гол; ворота; мета
win|перемагати
lose|програвати
train|тренуватися
exercise|фізична вправа; тренуватися`},
  {id:'a2-rest',name:'Sleep and Rest',ukTitle:'сон та відпочинок',raw:`sleep|спати; сон
rest|відпочивати; відпочинок
relax|розслаблятися
tired|втомлений
sleepy|сонний
awake|той, хто не спить
asleep|той, хто спить
bed|ліжко
pillow|подушка
blanket|ковдра
pyjamas|піжама
alarm clock|будильник
bedtime|час іти спати
nap|короткий сон удень
dream|сон; сновидіння; мрія
nightmare|кошмар
go to bed|лягати спати
fall asleep|засинати
wake up|прокидатися
get up|вставати
have a rest|відпочити
take a break|зробити перерву
sleep well|добре спати
lie down|лягти
stay up late|не лягати до пізньої ночі
oversleep|проспати (пізно прокинутися)`},
  {id:'a2-animals',name:'Animals',ukTitle:'тварини',raw:`animal|тварина
pet|домашній улюбленець
dog|собака
cat|кіт; кішка
puppy|цуценя
kitten|кошеня
bird|птах
fish|риба
horse|кінь
cow|корова
pig|свиня
sheep|вівця; вівці
goat|коза
chicken|курка
duck|качка
rabbit|кролик
mouse|миша
rat|щур
fox|лисиця
wolf|вовк
bear|ведмідь
lion|лев
tiger|тигр
elephant|слон
monkey|мавпа
giraffe|жирафа
snake|змія
frog|жаба
butterfly|метелик
bee|бджола`},
  {id:'a2-nature',name:'Nature',ukTitle:'природа',raw:`nature|природа
world|світ
earth|земля; ґрунт
sky|небо
sun|сонце
moon|місяць
star|зірка
cloud|хмара
air|повітря
water|вода
land|земля; суходіл
sea|море
ocean|океан
river|річка
lake|озеро
mountain|гора
hill|пагорб
forest|ліс
tree|дерево
leaf|листок
flower|квітка
grass|трава
field|поле
beach|пляж
island|острів
stone|камінь
sand|пісок
snow|сніг
rain|дощ
wind|вітер`},
  {id:'a2-relationships',name:'Relationships and Friendship',ukTitle:'стосунки та дружба',raw:`friend|друг; подруга
friendship|дружба
best friend|найкращий друг; найкраща подруга
close friend|близький друг; близька подруга
relationship|стосунки
couple|пара (двоє людей)
partner|партнер; партнерка
boyfriend|хлопець (у стосунках)
girlfriend|дівчина (у стосунках)
husband|чоловік (у шлюбі)
wife|дружина
neighbour|сусід; сусідка
guest|гість; гостя
trust|довіряти; довіра
respect|поважати; повага
care|турбота; піклуватися
support|підтримка; підтримувати
help|допомагати; допомога
share|ділитися
meet|зустрічатися; знайомитися
make friends|заводити друзів
spend time together|проводити час разом
get along|ладнати
keep in touch|підтримувати зв'язок
argue|сперечатися
forgive|пробачати`},
  {id:'a2-phones',name:'Phones and Communication',ukTitle:'телефони та зв’язок',raw:`phone|телефон
smartphone|смартфон
phone number|номер телефону
call|дзвінок; телефонувати
text message|текстове повідомлення
voice message|голосове повідомлення
email|електронний лист; електронна пошта
contact|контакт
screen|екран
keyboard|клавіатура
charger|зарядний пристрій
battery|акумулятор; батарея
signal|сигнал
internet|інтернет
Wi-Fi|вайфай; бездротова мережа
app|застосунок
password|пароль
notification|сповіщення
send a message|надіслати повідомлення
make a call|зателефонувати
answer the phone|відповісти на дзвінок
hang up|завершити дзвінок
charge the phone|зарядити телефон
turn on|увімкнути
turn off|вимкнути
I can't hear you|я вас не чую`},
  {id:'a2-actions',name:'Actions and Movements',ukTitle:'дії та рухи',raw:`walk|ходити; йти пішки
run|бігти
jump|стрибати
stand|стояти
sit|сидіти
sit down|сідати
stand up|вставати
lie down|лягати
move|рухатися; переміщувати
turn|повертати; повертатися
stop|зупинятися; зупиняти
start|починати
come|приходити
go|йти
leave|йти геть; залишати
enter|входити
follow|слідувати за; іти за
climb|лізти; підніматися
push|штовхати
pull|тягнути
lift|піднімати
carry|нести
hold|тримати
pick up|піднімати; підбирати
put down|класти; опускати
throw|кидати
catch|ловити
kick|бити ногою
wave|махати (рукою)
point|вказувати (пальцем)`},
  {id:'a2-irregular-verbs',name:'Irregular Verbs',ukTitle:'неправильні дієслова',raw:`be|бути
have|мати
do|робити
go|йти; їхати
come|приходити
get|отримувати; ставати
make|робити; виготовляти
take|брати
give|давати
see|бачити
know|знати
think|думати
say|казати
tell|розповідати; сказати комусь
find|знаходити
leave|залишати; йти геть
feel|відчувати
put|класти
bring|приносити
buy|купувати
eat|їсти
drink|пити
read|читати
write|писати
speak|говорити
hear|чути
meet|зустрічати
run|бігти
sit|сидіти
stand|стояти
sleep|спати
keep|зберігати; тримати
lose|губити; програвати
pay|платити
send|надсилати
understand|розуміти`},
  {id:'a2-adverbs',name:'Adverbs',ukTitle:'прислівники',raw:`always|завжди
usually|зазвичай
often|часто
sometimes|іноді
rarely|рідко
never|ніколи
already|уже
still|досі; усе ще
yet|ще (у запереченнях); уже (у питаннях)
just|щойно; лише
soon|скоро
now|зараз
then|тоді; потім
here|тут
there|там
everywhere|скрізь
quickly|швидко
slowly|повільно
carefully|уважно; обережно
easily|легко
well|добре
badly|погано
quietly|тихо
loudly|голосно
together|разом
alone|наодинці
again|знову
almost|майже
really|справді; дуже
probably|імовірно`},
  {id:'a2-everyday-expressions',name:'Everyday Expressions',ukTitle:'повсякденні вислови',raw:`what's the matter?|що сталося?
how's it going?|як справи?
long time no see|давно не бачилися
I'm on my way|я вже в дорозі
just a moment|хвилинку
take your time|не поспішай
hurry up|поквапся
be careful|будь обережним / обережною
good luck|щасти
well done|молодець; добре зроблено
sounds good|звучить добре
that's a good idea|це гарна ідея
I think so|я так думаю
I don't think so|я так не думаю
it depends|це залежить від обставин
of course|звичайно
no problem|без проблем
it's up to you|тобі вирішувати
let me know|дай мені знати
I'll be right back|я зараз повернуся
see you soon|до скорої зустрічі
have fun|гарно розважся
enjoy your meal|смачного
what do you mean?|що ти маєш на увазі?
I have no idea|я не маю уявлення
let's go|ходімо
don't worry|не хвилюйся
I'm looking forward to it|я з нетерпінням цього чекаю`}
];
for(const [index,section] of stageTwoSections.entries()){
  categories.push({id:section.id,name:section.name,en:section.name,ukTitle:section.ukTitle,stage:2,color:'olive',note:section.ukTitle,tile:['0% 0%','66.66% 14.28%','33.33% 0%','0% 42.85%'][index%4]});
  for(const line of section.raw.split('\n')){
    const [en,uk]=line.split('|');
    words.push({id:section.id+'-'+encodeURIComponent(en.toLowerCase()),en,uk,category:section.id});
  }
}
