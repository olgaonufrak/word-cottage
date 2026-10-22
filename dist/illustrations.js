'use strict';
// Exact English names plus Ukrainian meaning guards keep homographs distinct.
// c:picture:cell uses the user's existing artwork; s:name uses local SVGs.
// Some concepts use a clear association, such as time -> clock or idea -> bulb.
const vocabularyPictureRows=`
apple,apples|яблук|s:1f34e|Яблуко
banana,bananas|банан|s:1f34c|Банан
orange,oranges|апельсин|s:1f34a|Апельсин
pear,pears|груш|c:1:3|Груші
lemon,lemons|лимон|c:0:4|Лимони
grape,grapes|виноград|s:1f347|Виноград
peach,peaches|персик|s:1f351|Персик
plum,plums|слив|c:3:22|Сливи
cherry,cherries|вишн|черешн|c:0:7|Вишні
strawberry,strawberries|полуниц|c:0:0|Полуниці
blueberry,blueberries|лохин|чорниц|c:1:15|Ягоди лохини
blackberry,blackberries|ожин|c:2:7|Ожина
watermelon|кавун|s:1f349|Кавун
melon|дин|s:1f348|Диня
pineapple|ананас|s:1f34d|Ананас
kiwi,kiwifruit|ківі|s:1f95d|Ківі
coconut|кокос|s:1f965|Кокос
mango|манго|s:1f96d|Манго
pomegranate|гранат|c:2:0|Гранат
avocado|авокадо|s:1f951|Авокадо
potato,potatoes|картопл|s:1f954|Картопля
tomato,tomatoes|помідор|томат|s:1f345|Помідор
cucumber|огір|s:1f952|Огірок
carrot,carrots|моркв|s:1f955|Морква
onion|цибул|s:1f9c5|Цибуля
garlic|часник|s:1f9c4|Часник
lettuce|салат|s:1f96c|Листовий салат
bell pepper|перець|s:1fad1|Солодкий перець
corn|кукурудз|s:1f33d|Кукурудза
broccoli|броколі|s:1f966|Броколі
aubergine,eggplant|баклажан|s:1f346|Баклажан
mushroom,mushrooms|гриб|s:1f344|Гриби
bread|хліб|c:1:12|Хліб
butter|масло|s:1f9c8|Вершкове масло
cheese|сир|s:1f9c0|Сир
milk|молок|s:1f95b|Молоко
egg,eggs|яйц|s:1f95a|Яйце
meat|м'яс|м’яс|s:1f969|М’ясо
chicken|курятин|s:1f357|Курятина
chicken,hen|курк|s:1f414|Курка
rice|рис|s:1f35a|Рис
pasta,spaghetti|макарон|спагеті|s:1f35d|Спагеті
salt|сіль|s:1f9c2|Сіль
soup|суп|s:1f372|Суп
salad|салат|s:1f957|Овочевий салат
sandwich|бутерброд|сендвіч|s:1f96a|Сендвіч
jam|варенн|джем|c:0:11|Варення
honey|мед|s:1f36f|Мед
biscuit,cookie|печив|s:1f36a|Печиво
cake|торт|s:1f382|Торт
chocolate|шоколад|s:1f36b|Шоколад
pizza|піца|s:1f355|Піца
hamburger,burger|гамбургер|бургер|s:1f354|Гамбургер
chips,french fries|картопл|фрі|s:1f35f|Картопля фрі
ice cream|морозив|s:1f368|Морозиво
pie|пиріг|s:1f967|Пиріг
croissant|круасан|s:1f950|Круасан
pancake,pancakes|млин|s:1f95e|Млинці
water,mineral water,still water,sparkling water|вод|s:1f4a7|Вода
tea,black tea,a cup of tea|ча[йю]|c:1:21|Чашка чаю
green tea|ча[йю]|s:1f375|Зелений чай
coffee|кав|s:2615|Чашка кави
juice,orange juice,apple juice|сік|s:1f9c3|Сік
wine|вино|s:1f377|Вино
beer|пиво|s:1f37a|Пиво
bottle|пляш|s:1f37e|Пляшка
cup|чаш|c:1:21|Чашка
mug|горнят|чаш|c:3:7|Горнятко
glass|склян|s:1f95b|Склянка
plate|таріл|s:1f37d|Тарілка
bowl|миск|s:1f963|Миска
spoon,teaspoon,tablespoon|ложк|s:1f944|Ложка
knife|ніж|s:1f52a|Ніж
fork|видел|s:1f374|Виделка та ніж
frying pan|сковор|s:1f373|Сковорода
scales|ваг|s:2696|Терези
chair|стілец|стільц|s:1fa91|Стілець
sofa,couch|диван|s:1f6cb|Диван
bed|ліжк|s:1f6cf|Ліжко
door|двер|s:1f6aa|Двері
window|вікн|c:2:8|Вікно
mirror|дзеркал|c:2:6|Дзеркало
light bulb,bulb|лампоч|s:1f4a1|Лампочка
candle|свічк|s:1f56f|Свічка
clock|годинник|s:1f570|Настільний годинник
pocket watch|кишеньков|c:3:18|Кишеньковий годинник
watch|годинник|s:231a|Наручний годинник
key|^ключ([ ;,(]|$)|c:0:13|Ключ
lock|замок|s:1f512|Замок
basket|кошик|c:0:3|Кошик
laundry basket|кошик|s:1f9fa|Кошик для білизни
storage box,box|короб|s:1f4e6|Коробка
bin,dustbin|сміт|s:1f5d1|Відро для сміття
broom|мітл|s:1f9f9|Мітла
bucket|відр|s:1faa3|Відро
soap|мил[оа]|s:1f9fc|Мило
sponge|губк|s:1f9fd|Губка
toilet paper|туалетн|s:1f9fb|Туалетний папір
toilet|туалет|s:1f6bd|Туалет
bath,bathtub|ванн|s:1f6c1|Ванна
shower|душ|s:1f6bf|Душ
toothbrush|зубн|s:1faa5|Зубна щітка
razor|бритв|s:1fa92|Бритва
scissors|ножиц|s:2702|Ножиці
battery|батаре|акумулят|s:1f50b|Батарейка
plug|вилк|s:1f50c|Електрична вилка
television,tv|телевізор|s:1f4fa|Телевізор
radio|радіо|s:1f4fb|Радіо
computer,desktop computer|комп'ютер|комп’ютер|s:1f5a5|Комп’ютер
laptop|ноутбук|s:1f4bb|Ноутбук
keyboard|клавіатур|s:2328|Клавіатура
mouse|комп'ютер|комп’ютер|s:1f5b1|Комп’ютерна миша
printer|принтер|s:1f5a8|Принтер
phone,mobile phone,smartphone|телефон|смартфон|s:1f4f1|Телефон
camera|камер|фотоапарат|s:1f4f7|Фотоапарат
headphones|навушник|s:1f3a7|Навушники
microphone|мікрофон|s:1f3a4|Мікрофон
book,books|книж|книг|c:3:13|Книжки
notebook|зошит|блокнот|s:1f4d3|Зошит
pen|ручк|s:1f58a|Ручка
pencil|олівець|s:270f|Олівець
ruler|лінійк|s:1f4cf|Лінійка
paperclip|скріпк|s:1f4ce|Скріпка
envelope|конверт|c:1:10|Конверт
letter|лист|s:2709|Лист
newspaper|газет|s:1f4f0|Газета
map|карт|s:1f5fa|Мапа
calendar|календар|s:1f4c5|Календар
bag,handbag|сумк|s:1f45c|Сумка
backpack,rucksack|рюкзак|s:1f392|Рюкзак
suitcase,luggage|валіз|багаж|s:1f9f3|Валіза
t-shirt|футболк|s:1f455|Футболка
jeans,trousers|джинс|штан|s:1f456|Штани
coat|пальт|s:1f9e5|Пальто
dress|сукн|s:1f457|Сукня
socks|шкарпет|s:1f9e6|Шкарпетки
hat|капелюх|s:1f452|Капелюх
cap|кепк|s:1f9e2|Кепка
scarf|шарф|s:1f9e3|Шарф
gloves|рукавич|s:1f9e4|Рукавички
shoe,shoes|черевик|взутт|туфл|s:1f45e|Черевик
trainers,sneakers|кросів|s:1f45f|Кросівки
boots,rubber boots,wellington boots|чоб|s:1f97e|Чобіт
high heels|підбор|s:1f460|Туфля на підборах
sandals|сандал|босоніж|s:1f461|Босоніжка
glasses,spectacles|окуляр|s:1f453|Окуляри
sunglasses|окуляр|s:1f576|Сонцезахисні окуляри
umbrella|парасол|s:2602|Парасоля
ring|каблуч|перст|s:1f48d|Каблучка
diamond|діамант|алмаз|s:1f48e|Діамант
car|автомобіл|машин|s:1f697|Автомобіль
bus|автобус|s:1f68c|Автобус
train|поїзд|потяг|s:1f686|Поїзд
tram|трамва|s:1f68b|Трамвай
underground,subway,metro|метро|s:1f687|Метро
taxi|таксі|s:1f695|Таксі
bicycle,bike|велосипед|s:1f6b2|Велосипед
motorbike,motorcycle|мотоцикл|s:1f3cd|Мотоцикл
plane,airplane,aeroplane|літак|s:2708|Літак
boat|човен|s:1f6a3|Човен
ship|кораб|судно|s:1f6a2|Корабель
truck,lorry|вантажів|s:1f69a|Вантажівка
ambulance|швидк|s:1f691|Швидка допомога
fire engine|пожежн|s:1f692|Пожежна машина
helicopter|вертоліт|гелікоптер|s:1f681|Гелікоптер
rocket|ракет|s:1f680|Ракета
traffic light,traffic lights|світлофор|s:1f6a6|Світлофор
ticket,return ticket,single ticket|квиток|s:1f3ab|Квиток
house,home,cottage|будинок|будин|дім|хат|c:0:6|Будинок
school|школ|s:1f3eb|Школа
hospital|лікарн|s:1f3e5|Лікарня
hotel|готел|s:1f3e8|Готель
bank|банк|s:1f3e6|Банк
church|церкв|s:26ea|Церква
castle|замок|фортец|s:1f3f0|Замок
bridge|міст|s:1f309|Міст
tent|намет|s:26fa|Намет
fountain|фонтан|s:26f2|Фонтан
dog,puppy|собак|цуцен|пес|s:1f415|Собака
cat,kitten|кіт|кішк|кот|кошен|s:1f408|Кіт
bird|птах|c:0:10|Птах
fish|риб|s:1f41f|Риба
horse|кінь|кон|s:1f40e|Кінь
cow|коров|s:1f404|Корова
pig|свин|s:1f416|Свиня
sheep|вівц|s:1f411|Вівця
goat|коз|s:1f410|Коза
duck|качк|s:1f986|Качка
goose|гус|c:1:0|Гуска
swan|лебід|c:3:0|Лебідь
rabbit|крол|s:1f407|Кролик
hare|заєць|зайц|c:2:19|Заєць
deer|олень|олен|c:1:11|Олень
mouse|миш|s:1f401|Миша
rat|щур|s:1f400|Щур
fox|лисиц|s:1f98a|Лисиця
wolf|вовк|s:1f43a|Вовк
bear|ведмід|s:1f43b|Ведмідь
lion|лев|s:1f981|Лев
tiger|тигр|s:1f405|Тигр
elephant|слон|s:1f418|Слон
monkey|мавп|s:1f412|Мавпа
giraffe|жираф|s:1f992|Жирафа
zebra|зебр|s:1f993|Зебра
snake|змія|змії|s:1f40d|Змія
frog|жаб|s:1f438|Жаба
turtle,tortoise|черепах|s:1f422|Черепаха
crocodile|крокодил|s:1f40a|Крокодил
whale|кит|s:1f40b|Кит
dolphin|дельфін|s:1f42c|Дельфін
shark|акул|s:1f988|Акула
octopus|восьмин|s:1f419|Восьминіг
crab|краб|s:1f980|Краб
lobster|омар|лобстер|s:1f99e|Омар
shrimp,prawn|кревет|s:1f990|Креветка
owl|сова|s:1f989|Сова
eagle|орел|s:1f985|Орел
parrot|папуг|s:1f99c|Папуга
penguin|пінгвін|s:1f427|Пінгвін
dove,pigeon|голуб|горлиц|s:1f54a|Голуб
bat|кажан|s:1f987|Кажан
feather|перо|пір|s:1fab6|Перо
butterfly|метелик|s:1f98b|Метелик
moth|метелик|міль|c:2:3|Нічний метелик
bee,bumblebee|бджол|джміл|s:1f41d|Бджола
ant|мурах|s:1f41c|Мураха
ladybird,ladybug|сонечко|s:1f41e|Сонечко
beetle|жук|s:1fab2|Жук
fly|муха|s:1fab0|Муха
mosquito|комар|s:1f99f|Комар
dragonfly|бабк|c:3:14|Бабка
cricket|цвіркун|s:1f997|Цвіркун
cockroach|тарган|s:1fab3|Тарган
spider|павук|s:1f577|Павук
snail|равлик|c:1:17|Равлик
worm|черв|s:1fab1|Черв’як
flower,flowers|квіт|c:3:17|Квіти
bouquet|букет|c:2:10|Букет
rose|троянд|s:1f339|Троянда
tulip|тюльпан|s:1f337|Тюльпан
daisy|стокрот|маргарит|c:3:17|Маргаритки
sunflower|соняшник|s:1f33b|Соняшник
lavender|лаванд|c:3:11|Лаванда
snowdrop|підсніж|c:3:3|Підсніжники
lily of the valley|конвалі|c:0:2|Конвалії
plant|рослин|s:1fab4|Рослина
flowerpot|горщик|s:1fab4|Квітковий горщик
tree|дерев|s:1f333|Дерево
pine|сосн|s:1f332|Сосна
leaf|листок|листя|s:1f343|Листок
maple|клен|s:1f341|Кленовий листок
branch|гілк|c:0:20|Гілка
acorn|жолуд|c:3:19|Жолуді
seedling|парост|саджан|s:1f331|Паросток
watering can|лійк|c:1:14|Лійка
sun|сонц|s:2600|Сонце
moon|місяць|s:1f319|Місяць
star|зірк|s:2b50|Зірка
cloud|хмар|s:2601|Хмара
rain|дощ|c:3:10|Дощ
snow,snowflake|сніг|сніжин|s:2744|Сніжинка
snowman|сніговик|s:26c4|Сніговик
rainbow|веселк|райдуг|s:1f308|Веселка
lightning|блискавк|s:26a1|Блискавка
fire|вогонь|s:1f525|Вогонь
mountain|гор[аи]|s:26f0|Гора
volcano|вулкан|s:1f30b|Вулкан
island|острів|s:1f3dd|Острів
beach|пляж|s:1f3d6|Пляж
desert|пустел|s:1f3dc|Пустеля
wave|хвил|s:1f30a|Хвиля
earth,world,globe|земл|світ|глобус|s:1f30d|Земна куля
shell,seashell|мушл|s:1f41a|Мушля
stone,rock|камін|кам'|кам’|s:1faa8|Камінь
wood|деревин|s:1fab5|Деревина
brick|цегл|s:1f9f1|Цегла
magnet|магніт|s:1f9f2|Магніт
ladder|драбин|s:1fa9c|Драбина
hammer|молот|s:1f528|Молоток
screwdriver|викрутк|s:1fa9b|Викрутка
saw|пилк|s:1fa9a|Пилка
wrench,spanner|ключ|s:1f527|Гайковий ключ
nut and bolt|гайк|болт|s:1f529|Гайка й болт
axe|сокир|s:1fa93|Сокира
anchor|якір|s:2693|Якір
football,soccer ball|футбол|м'яч|м’яч|s:26bd|Футбольний м’яч
basketball|баскетбол|s:1f3c0|Баскетбольний м’яч
tennis|теніс|s:1f3be|Тенісна ракетка й м’яч
volleyball|волейбол|s:1f3d0|Волейбольний м’яч
guitar|гітар|s:1f3b8|Гітара
violin|скрипк|s:1f3bb|Скрипка
drum|барабан|s:1f941|Барабан
trumpet|труб|s:1f3ba|Труба
saxophone|саксофон|s:1f3b7|Саксофон
chess|шах|s:265f|Шахова фігура
chess pawn|пішак|s:265f|Пішак
dice|кубик|s:1f3b2|Гральний кубик
puzzle|пазл|головолом|s:1f9e9|Пазл
gift,present|подарун|s:1f381|Подарунок
balloon|кульк|s:1f388|Повітряна кулька
flag|прапор|s:1f6a9|Прапор
heart|серц|s:2764|Серце
brain|мозок|s:1f9e0|Мозок
eye|око|s:1f441|Око
ear|вухо|s:1f442|Вухо
nose|ніс|s:1f443|Ніс
mouth|рот|s:1f444|Рот
tooth,teeth|зуб|s:1f9b7|Зуб
tongue|язик|s:1f445|Язик
hand|рук|кист|s:270b|Кисть руки
leg|ног|s:1f9b5|Нога
foot,feet|стоп|s:1f9b6|Стопа
bone|кістк|s:1f9b4|Кістка
lungs|леген|s:1fac1|Легені
pill,tablet|таблет|пігул|s:1f48a|Пігулка
thermometer|термометр|s:1f321|Термометр
syringe|шприц|s:1f489|Шприц
stethoscope|стетоскоп|s:1fa7a|Стетоскоп
red|червон|s:1f7e5|Червоний колір
orange|помаранч|s:1f7e7|Помаранчевий колір
yellow|жовт|s:1f7e8|Жовтий колір
green|зелен|s:1f7e9|Зелений колір
blue|син|блакит|s:1f7e6|Синій колір
purple|фіолет|s:1f7ea|Фіолетовий колір
brown|коричн|s:1f7eb|Коричневий колір
black|чорн|s:2b1b|Чорний колір
white|біл|s:2b1c|Білий колір
air conditioner|кондиціонер|s:appliance-air-conditioner|Кондиціонер
air fryer|аерофритюрниця|s:appliance-air-fryer|Аерофритюрниця
blender|блендер|s:appliance-blender|Блендер
coffee maker|кавоварка|s:appliance-coffee-maker|Кавоварка
cooker|кухонна плита|s:appliance-cooker|Кухонна плита
dishwasher|посудомийна машина|s:appliance-dishwasher|Посудомийна машина
electric kettle|електрочайник|s:appliance-electric-kettle|Електричний чайник
extractor fan|витяжка|s:appliance-extractor-fan|Кухонна витяжка
fan|вентилятор|s:appliance-fan|Вентилятор
food processor|кухонний комбайн|s:appliance-food-processor|Кухонний комбайн
freezer|морозильна камера|s:appliance-freezer|Морозильна камера
fridge|холодильник|s:appliance-fridge|Холодильник
hair dryer|фен|s:appliance-hair-dryer|Фен
heater|обігрівач|s:appliance-heater|Обігрівач
hob|варильна поверхня|s:appliance-hob|Варильна поверхня
humidifier|зволожувач повітря|s:appliance-humidifier|Зволожувач повітря
iron|праска|s:appliance-iron|Праска
microwave|мікрохвильова піч|s:appliance-microwave|Мікрохвильова піч
mixer|міксер|s:appliance-mixer|Міксер
oven|духовка|s:appliance-oven|Духовка
remote control|пульт дистанційного керування|s:appliance-remote-control|Пульт дистанційного керування
robot vacuum|робот-пилосос|s:appliance-robot-vacuum|Робот-пилосос
toaster|тостер|s:appliance-toaster|Тостер
tumble dryer|сушильна машина|s:appliance-tumble-dryer|Сушильна машина
vacuum cleaner|пилосос|s:appliance-vacuum-cleaner|Пилосос
washing machine|пральна машина|s:appliance-washing-machine|Пральна машина
arm|рука|s:body-arm|Рука (від плеча до кисті)
back|спина|s:body-back|Спина; задня частина
body|тіло|s:body-body|Тіло
cheek|щока|s:body-cheek|Щока
chest|груди|s:body-chest|Груди
chin|підборіддя|s:body-chin|Підборіддя
elbow|лікоть|s:body-elbow|Лікоть
face|обличчя|s:body-face|Обличчя
finger|палець руки|s:body-finger|Палець руки
forehead|лоб|s:body-forehead|Лоб
hair|волосся|s:body-hair|Волосся
head|голова|s:body-head|Голова
knee|коліно|s:body-knee|Коліно
lip|губа|s:body-lip|Губа
neck|шия|s:body-neck|Шия
shoulder|плече|s:body-shoulder|Плече
stomach|живіт; шлунок|s:body-stomach|Живіт; шлунок
thumb|великий палець руки|s:body-thumb|Великий палець руки
toe|палець ноги|s:body-toe|Палець ноги
armchair|крісло|s:home-armchair|Крісло
balcony|балкон|s:home-balcony|Балкон
bed sheet|простирадло|s:home-bed-sheet|Простирадло
bedside table|тумбочка біля ліжка|s:home-bedside-table|Тумбочка біля ліжка
blanket|ковдра|s:home-blanket|Ковдра
blinds|жалюзі|s:home-blinds|Жалюзі
bookcase|книжкова шафа|s:home-bookcase|Книжкова шафа
carpet|килим|s:home-carpet|Килим
ceiling|стеля|s:home-ceiling|Стеля
chopping board|дошка для нарізання|s:home-chopping-board|Дошка для нарізання
coat hanger|вішак для одягу|s:home-coat-hanger|Вішак для одягу
colander|друшляк|s:home-colander|Друшляк
cupboard|шафа для посуду або речей|s:home-cupboard|Шафа для посуду або речей
curtain|штора|s:home-curtain|Штора
desk|письмовий стіл|s:home-desk|Письмовий стіл
doormat|килимок біля дверей|s:home-doormat|Килимок біля дверей
drawer|шухляда|s:home-drawer|Шухляда
dustpan|совок для сміття|s:home-dustpan|Совок для сміття
extension lead|електричний подовжувач|s:home-extension-lead|Електричний подовжувач
floor|підлога|поверх|s:home-floor|Підлога
furniture|меблі|s:home-furniture|Меблі
garage|гараж|s:home-garage|Гараж
grater|тертка|s:home-grater|Тертка
kitchen scales|кухонні ваги|s:home-kitchen-scales|Кухонні ваги
ladle|ополоник|s:home-ladle|Ополоник
lamp|лампа|s:home-lamp|Лампа
mattress|матрац|s:home-mattress|Матрац
mop|швабра|s:home-mop|Швабра
picture frame|рамка для фотографії або картини|s:home-picture-frame|Рамка для фотографії або картини
pillow|подушка|s:home-pillow|Подушка
rolling pin|качалка|s:home-rolling-pin|Качалка
roof|дах|s:home-roof|Дах
shelf|полиця|s:home-shelf|Полиця
socket|розетка|s:home-socket|Розетка
stairs|сходи|s:home-stairs|Сходи
table|стіл|s:home-table|Стіл
towel|рушник|s:home-towel|Рушник
vase|ваза|s:home-vase|Ваза
wall|стіна|s:home-wall|Стіна
wardrobe|шафа для одягу|s:home-wardrobe|Шафа для одягу
whisk|збивати вінчиком|вінчик|s:home-whisk|Збивати вінчиком
attic|горище|s:room-attic|Горище
basement|підвал|s:room-basement|Підвал
bathroom|ванна кімната|s:room-bathroom|Ванна кімната
bedroom|спальня|s:room-bedroom|Спальня
dining room|їдальня|s:room-dining-room|Їдальня
guest room|гостьова кімната|s:room-guest-room|Гостьова кімната
hall|передпокій|s:room-hall|Передпокій
kitchen|кухня|s:room-kitchen|Кухня
living room|вітальня|s:room-living-room|Вітальня
room|кімната|s:room-room|Кімната
study|кабінет|s:room-study|Кабінет
zero|нуль|s:learn-number-0|Число 0
one|один|s:learn-number-1|Число 1
two|два|s:learn-number-2|Число 2
three|три|s:learn-number-3|Число 3
four|чотири|s:learn-number-4|Число 4
five|п['’]ять|s:learn-number-5|Число 5
six|шість|s:learn-number-6|Число 6
seven|сім|s:learn-number-7|Число 7
eight|вісім|s:learn-number-8|Число 8
nine|дев['’]ять|s:learn-number-9|Число 9
ten|десять|s:learn-number-10|Число 10
eleven|одинадцять|s:learn-number-11|Число 11
twelve|дванадцять|s:learn-number-12|Число 12
thirteen|тринадцять|s:learn-number-13|Число 13
fourteen|чотирнадцять|s:learn-number-14|Число 14
fifteen|п['’]ятнадцять|s:learn-number-15|Число 15
sixteen|шістнадцять|s:learn-number-16|Число 16
seventeen|сімнадцять|s:learn-number-17|Число 17
eighteen|вісімнадцять|s:learn-number-18|Число 18
nineteen|дев['’]ятнадцять|s:learn-number-19|Число 19
twenty|двадцять|s:learn-number-20|Число 20
thirty|тридцять|s:learn-number-30|Число 30
forty|сорок|s:learn-number-40|Число 40
fifty|п['’]ятдесят|s:learn-number-50|Число 50
sixty|шістдесят|s:learn-number-60|Число 60
seventy|сімдесят|s:learn-number-70|Число 70
eighty|вісімдесят|s:learn-number-80|Число 80
ninety|дев['’]яносто|s:learn-number-90|Число 90
one hundred|сто|s:learn-number-100|Число 100
one thousand|тисяча|s:learn-number-1000|Число 1000
first|перший|s:learn-ordinal-1|Місце 1 у послідовності
second|другий|s:learn-ordinal-2|Місце 2 у послідовності
third|третій|s:learn-ordinal-3|Місце 3 у послідовності
fourth|четвертий|s:learn-ordinal-4|Місце 4 у послідовності
fifth|п['’]ятий|s:learn-ordinal-5|Місце 5 у послідовності
sixth|шостий|s:learn-ordinal-6|Місце 6 у послідовності
seventh|сьомий|s:learn-ordinal-7|Місце 7 у послідовності
eighth|восьмий|s:learn-ordinal-8|Місце 8 у послідовності
ninth|дев['’]ятий|s:learn-ordinal-9|Місце 9 у послідовності
tenth|десятий|s:learn-ordinal-10|Місце 10 у послідовності
Monday|понеділок|s:learn-weekday-0|Календар: понеділок
Tuesday|вівторок|s:learn-weekday-1|Календар: вівторок
Wednesday|середа|s:learn-weekday-2|Календар: середа
Thursday|четвер|s:learn-weekday-3|Календар: четвер
Friday|п['’]ятниц|s:learn-weekday-4|Календар: п’ятниця
Saturday|субот|s:learn-weekday-5|Календар: субота
Sunday|неділ|s:learn-weekday-6|Календар: неділя
week|тиждень|s:learn-week|Тиждень у календарі
weekday|будній|s:learn-weekday|Будні в календарі
weekend|вихідн|s:learn-weekend|Вихідні в календарі
month|місяць|s:learn-month|Місяць у календарі
day|день|s:learn-day|День у календарі
January|січень|s:learn-month-1|Календар: січень
February|лютий|s:learn-month-2|Календар: лютий
March|березень|s:learn-month-3|Календар: березень
April|квітень|s:learn-month-4|Календар: квітень
May|травень|s:learn-month-5|Календар: травень
June|червень|s:learn-month-6|Календар: червень
July|липень|s:learn-month-7|Календар: липень
August|серпень|s:learn-month-8|Календар: серпень
September|вересень|s:learn-month-9|Календар: вересень
October|жовтень|s:learn-month-10|Календар: жовтень
November|листопад|s:learn-month-11|Календар: листопад
December|грудень|s:learn-month-12|Календар: грудень
year|рік|s:learn-year|Дванадцять місяців року
time,hour,what time|час|годин|s:learn-clock|Годинник — час
minute,second|хвилин|секунд|s:learn-minute|Годинник із секундною стрілкою
o'clock|годин|s:learn-oclock|Годинник: 2:00
noon|полудень|s:learn-noon|Годинник: 12:00
midnight|північ|s:learn-midnight|Годинник: 0:00
half past two|пів на третю|s:learn-half-past-two|Годинник: 2:30
a quarter past two|чверть на третю|s:learn-quarter-past-two|Годинник: 2:15
a quarter to three|за чверть третя|s:learn-quarter-to-three|Годинник: 2:45
light blue|блакит|s:learn-color-light-blue|Зразок кольору
dark blue|темно-син|s:learn-color-dark-blue|Зразок кольору
pink|рожев|s:learn-color-pink|Зразок кольору
grey|сір|s:learn-color-grey|Зразок кольору
gold|золот|s:learn-color-gold|Зразок кольору
silver|сріб|s:learn-color-silver|Зразок кольору
circle,round|коло|круглий|s:learn-circle|Геометрична фігура
square,square-shaped|квадрат|s:learn-square|Геометрична фігура
triangle|трикутник|s:learn-triangle|Геометрична фігура
rectangle|прямокутник|s:learn-rectangle|Геометрична фігура
oval|овал|s:learn-oval|Геометрична фігура
big,large,huge|великий|величезн|s:learn-big|Великий і маленький квадрати: виділено великий
small,little|маленьк|s:learn-small|Великий і маленький квадрати: виділено маленький
long|довг|s:learn-long|Довга і коротка смужки: виділено довгу
short|коротк|s:learn-short|Довга і коротка смужки: виділено коротку
high,tall|висок|s:learn-high|Високий і низький стовпчики: виділено високий
low,short|низьк|невисок|s:learn-low|Високий і низький стовпчики: виділено низький
wide|широк|s:learn-wide|Широка і вузька смужки: виділено широку
narrow|вузьк|s:learn-narrow|Широка і вузька смужки: виділено вузьку
thick|товст|s:learn-thick|Товста і тонка смужки: виділено товсту
thin|тонк|s:learn-thin|Товста і тонка смужки: виділено тонку
up|вгору|угору|s:learn-up|Стрілка: up
down|вниз|униз|s:learn-down|Стрілка: down
left|лів|s:learn-left|Стрілка: left
right|правий|праворуч|s:learn-right|Стрілка: right
full|повний|s:learn-full|Повна склянка
empty|порожній|s:learn-empty|Порожня склянка
open|відкрит|відчин|s:learn-open|Відчинені двері
closed|зачинен|закрит|s:learn-closed|Зачинені двері
light|світлий|s:learn-light|Світло: увімкнена лампа
dark|темний|s:learn-dark|Темрява: вимкнена лампа
Ukraine,Ukrainian|[Уу]країн|s:1f1fa-1f1e6|Прапор України
Poland,Polish|[Пп]оль|[Пп]оля|s:1f1f5-1f1f1|Прапор Польщі
Germany,German|[Нн]імеч|[Нн]імець|[Нн]імкен|s:1f1e9-1f1ea|Прапор Німеччини
France,French|[Фф]ранц|s:1f1eb-1f1f7|Прапор Франції
Italy,Italian|[Іі]тал|s:1f1ee-1f1f9|Прапор Італії
Spain,Spanish|[Іі]спан|s:1f1ea-1f1f8|Прапор Іспанії
the United Kingdom,British|[Сс]получен|[Бб]ритан|s:1f1ec-1f1e7|Прапор Сполученого Королівства
England,English|[Аа]нгл|s:1f3f4-e0067-e0062-e0065-e006e-e0067-e007f|Прапор Англії
the United States,American|[Сс]получен|[Аа]мерикан|s:1f1fa-1f1f8|Прапор США
Canada,Canadian|[Кк]анад|s:1f1e8-1f1e6|Прапор Канади
Australia,Australian|[Аа]встрал|s:1f1e6-1f1fa|Прапор Австралії
China,Chinese|[Кк]ита|s:1f1e8-1f1f3|Прапор Китаю
Japan,Japanese|[Яя]пон|s:1f1ef-1f1f5|Прапор Японії
Turkey,Turkish|[Тт]уреч|[Тт]уре|[Тт]урок|[Тт]урк|s:1f1f9-1f1f7|Прапор Туреччини
Brazil,Brazilian|[Бб]разил|s:1f1e7-1f1f7|Прапор Бразилії
country|країн|s:1f30d|Земна куля з країнами
building,office,office building,workplace|будівл|офіс|робоче місце|s:1f3e2|Офісна будівля
apartment,flat|квартир|s:learn-apartment|Багатоквартирний будинок
city,town,city centre,capital city|міст|столиц|s:1f3d9|Місто
village,hamlet,countryside|сел|хутір|сільськ|s:1f3d8|Будинки селища
road,street,avenue,motorway,highway|дорог|вулиц|проспект|шосе|автомагістрал|s:1f6e3|Дорога
bus stop|зупинк|s:1f68f|Автобусна зупинка
departure,take off|відправлення|злітати|s:1f6eb|Літак злітає
arrival,landing,land|прибуття|посадка|приземл|s:1f6ec|Літак приземляється
lift,elevator|ліфт|s:1f6d7|Ліфт
shopping,trolley,shopping cart,go shopping|покуп|магазин|візок|s:1f6d2|Візок із покупками
shopping bag|сумк|s:1f6cd|Сумки для покупок
shopping list|список|s:1f4cb|Список покупок
money,salary,cash|грош|заробітн|готівк|s:1f4b5|Гроші
credit card,bank card,pay,payment|карт|плат|s:1f4b3|Платіжна картка
coin,coins|монет|s:1fa99|Монета
receipt,invoice|чек|рахунок|s:1f9fe|Чек або рахунок
wallet,purse|гаман|s:1f45b|Гаманець
file,document,report|файл|документ|звіт|s:1f4c4|Документ
folder|папк|s:1f4c1|Папка
screen,monitor|екран|монітор|s:1f5a5|Екран комп’ютера
disk,save a file|диск|зберегти файл|s:1f4be|Дискета для збереження файлу
email,e-mail|електронн|s:1f4e7|Електронний лист
postbox,mailbox|поштов|s:1f4ee|Поштова скринька
chart,graph,statistics|діаграм|графік|статистик|s:1f4ca|Діаграма
spreadsheet|таблиц|s:1f4ca|Таблиця з діаграмою
presentation|презентац|s:1f4ca|Діаграма для презентації
contract|договір|s:1f4dc|Документ договору
stamp|печатк|s:1f4ae|Печатка
scales|ваги|s:2696|Терези
thread|нитк|s:1f9f5|Нитка
wool|вовн|s:1f9f6|Клубок вовни
needle,sewing needle|голк|s:1faa1|Швейна голка
safety pin|шпильк|s:1f9f7|Англійська шпилька
bandage|бинт|пов’язк|пов'язк|пластир|s:1fa79|Пластир
crutch|милиц|s:1fa7c|Милиця
wheelchair|кріс|візок|s:267f|Інвалідний візок
microscope,research|мікроскоп|дослідження|s:1f52c|Мікроскоп
test tube|пробірк|s:1f9ea|Пробірка
DNA|ДНК|s:1f9ec|Подвійна спіраль ДНК
experiment,chemistry|експеримент|хімі|s:2697|Лабораторна колба
magnetic compass,compass|компас|s:1f9ed|Компас
telescope|телескоп|s:1f52d|Телескоп
planet|планет|s:1fa90|Планета з кільцями
satellite|супутник|s:1f6f0|Супутник
comet|комет|s:2604|Комета
meteorite|метеорит|s:learn-meteorite|Метеорит на землі
galaxy,Milky Way,universe|галактик|Чумацьк|всесвіт|s:1f30c|Зоряне небо та Чумацький Шлях
spacecraft,space shuttle,launch|космічн|шатл|запуск|s:1f680|Космічна ракета
astronaut|астронавт|s:1f9d1-200d-1f680|Астронавт
forest,woodland|ліс|s:1f332|Лісові дерева
sea,ocean,surf,tide|мор[ея]|океан|прибій|приплив|s:1f30a|Морська хвиля
shore,coast,sand|берег|узбережж|пісок|s:1f3d6|Піщаний берег
sailboat|вітрильник|s:26f5|Вітрильник
parasol|парасол|s:26f1|Парасоля від сонця
coral,reef|корал|риф|s:1fab8|Корал
boulder,pebble|валун|камін|гальк|s:1faa8|Камінь
summit,peak,mountain range|вершин|гірськ|s:26f0|Гірська вершина
glacier|льодовик|s:1f3d4|Засніжена гора з льодовиком
firewood,log,trunk|дров|колод|стовбур|s:1fab5|Дерев’яні колоди
wheat|пшениц|s:learn-wheat|Пшеничний колос
barley|ячмін|s:learn-barley|Ячмінний колос
oats|овес|s:learn-oats|Вівсяне колосся
harvest|врожай|урожай|s:learn-wheat|Стигле колосся
tractor|трактор|s:1f69c|Трактор
garden,orchard|сад|город|s:1f333|Дерево в саду
seed|насін|s:learn-seed|Насінина
grow|рости|вирощ|s:1f331|Паросток
water the plants,water|полив|c:1:14|Лійка для поливу
autumn|осінь|s:1f342|Осіннє листя
spring|весна|s:1f338|Весняне цвітіння
summer|літо|s:2600|Літнє сонце
winter|зима|s:26c4|Зимовий сніговик
night,good night|ніч|на добраніч|s:1f303|Нічне небо
morning,good morning|ранок|ранку|s:1f305|Ранковий світанок
afternoon|після полудня|s:1f324|Денне сонце
evening,good evening|вечір|вечора|s:1f307|Вечірній захід сонця
recycle,recycling|перероб|s:267b|Знак перероблення
solar energy|сонячн|s:2600|Сонячна енергія
wind power|вітров|s:1f32c|Вітер
warning|попередження|s:26a0|Знак попередження
No entry|вхід заборонено|s:26d4|Вхід заборонено
forbidden,prohibition,ban|заборон|s:1f6ab|Знак заборони
law,legal,justice|закон|правосуд|s:2696|Терези правосуддя
power button|кнопка живлення|s:learn-power-button|Кнопка живлення
people,crowd,group|люди|натовп|група|s:1f465|Група людей
person,adult|людина|людин|s:1f9d1|Доросла людина
man,guy|чоловік|хлопець|s:1f468|Чоловік
woman|жінк|s:1f469|Жінка
boy|хлопчик|s:1f466|Хлопчик
girl|дівчин|s:1f467|Дівчинка
child,children,kid|дитин|діти|s:1f9d2|Дитина
baby|немовля|s:1f476|Немовля
family,parents|сім|родин|батьки|s:1f46a|Родина
mother,mum|мати|мама|s:1f469-200d-1f37c|Мама з немовлям
father,dad|батько|тато|s:1f468-200d-1f37c|Тато з немовлям
grandmother|бабус|s:1f475|Бабуся
grandfather|дідус|s:1f474|Дідусь
friend,friendship,meet friends|друг|подруг|дружб|друз|s:1f9d1-200d-1f91d-200d-1f9d1|Друзі тримаються за руки
student|студент|учень|учениц|s:1f9d1-200d-1f393|Студент у випускній шапці
teacher|учител|учитель|s:1f9d1-200d-1f3eb|Учитель біля дошки
doctor,nurse|лікар|медсестр|медбрат|s:1f9d1-200d-2695-fe0f|Медичний працівник
farmer|фермер|s:1f9d1-200d-1f33e|Фермер
cook|кухар|s:1f9d1-200d-1f373|Кухар
builder,construction worker|будівельник|s:1f477|Будівельник у касці
police officer,police|поліц|s:1f46e|Поліцейський
firefighter|пожежник|пожежниц|s:1f9d1-200d-1f692|Пожежник
artist|художник|художниц|s:1f9d1-200d-1f3a8|Художник із палітрою
programmer|програміст|s:1f9d1-200d-1f4bb|Програміст за комп'ютером
astronaut|астронавт|s:1f9d1-200d-1f680|Астронавт
singer|співак|співач|s:1f9d1-200d-1f3a4|Співак із мікрофоном
scientist|науков|вчен|s:1f9d1-200d-1f52c|Науковець
pilot|пілот|s:1f9d1-200d-2708-fe0f|Пілот
mechanic|механік|s:1f9d1-200d-1f527|Механік
beard|бород|s:1f9d4|Людина з бородою
blonde hair|світле волосся|s:1f471|Людина зі світлим волоссям
face|обличч|s:1f9d1|Обличчя людини
body|тіло|s:1f9cd|Людина на повний зріст
arm|рука|s:1f4aa|Зігнута в лікті рука
thumb|великий палець|s:1f44d|Великий палець руки
finger|палець руки|s:1f446|Піднятий вказівний палець
eyes|очі|s:1f440|Очі
ears|вуха|s:1f442|Вухо
happy,happiness,cheerful|щаслив|щаст|життєрадіс|s:1f600|Радісне обличчя
sad,sadness|сумн|смут|s:1f622|Сумне обличчя зі сльозою
angry,anger|сердит|гнів|s:1f620|Сердите обличчя
afraid,fear|налякан|страх|s:1f628|Налякане обличчя
worried|стурбован|s:1f61f|Стурбоване обличчя
excited|схвильован.*радос|s:1f929|Обличчя, захоплене радістю
bored,boring|знуджен|нудн|s:1f971|Обличчя, що позіхає
calm,relaxed,relax|спокійн|розслаб|s:1f60c|Спокійне розслаблене обличчя
nervous|нервов|схвильован|s:1f630|Схвильоване обличчя
shy,embarrassed|сором|зніяков|s:1f633|Зніяковіле обличчя
surprised,surprise|здивован|здивуван|s:1f62e|Здивоване обличчя
disappointed,disappointment|розчарован|розчаруван|s:1f61e|Розчароване обличчя
grateful|вдячн|s:1f64f|Складені долоні на знак вдячності
tired,fatigue|втом|виснажен|s:1f62b|Втомлене обличчя
sleepy|сонн|s:1f62a|Сонне обличчя
funny,a sense of humour|смішн|гумор|s:1f606|Обличчя, що сміється
hot|гаряч|спекот|s:1f975|Обличчя, якому спекотно
cold,chill,shiver|холод|озноб|тремт|s:1f976|Обличчя, якому холодно
strong,strength|сильн|сила|s:1f4aa|Напружені м'язи руки
young|молод|s:1f9d2|Молода людина
old|старий|літній|s:1f9d3|Літня людина
quiet|тих|мовчазн|s:1f92b|Жест тиші
loud,volume|гучн|s:1f50a|Динамік зі звуковими хвилями
love|любов|любити|кохат|s:2764|Серце
think,thought|думати|думк|s:1f914|Людина замислилася
idea|ідея|s:1f4a1|Лампочка як символ ідеї
see,look,sight|бачити|дивитися|зір|s:1f440|Очі
hear,hearing|чути|слух|s:1f442|Вухо
listen|слухати|s:1f3a7|Навушники
say,speak,talk|сказати|казати|говорити|s:1f5e3|Людина говорить
read,reading,read a book|читати|читання|s:1f4d6|Розгорнута книжка
write,writing|писати|письмо|s:270d|Рука пише ручкою
walk,go|ходити|іти|йти|s:1f6b6|Людина йде пішки
run,running|бігти|біг|s:1f3c3|Людина біжить
stand,stand up|стояти|вставати|s:1f9cd|Людина стоїть
climb|лізти|підніматися|s:1f9d7|Людина піднімається скелею
stop|зупин|s:1f6d1|Знак зупинки
wave|махати|s:1f44b|Рука махає на привітання
point|вказувати|s:1f446|Рука вказує пальцем
cut|різати|s:2702|Ножиці
sleep,asleep,fall asleep,sleep well,nap|спати|сон|засинати|s:1f634|Спляче обличчя
go to bed,bedtime|лягати спати|час іти спати|s:1f6cc|Людина в ліжку
eat,have lunch,have dinner|їсти|обідати|вечеряти|s:1f37d|Тарілка зі столовими приборами
drink|пити|s:1f964|Напій із соломинкою
drink coffee|пити каву|s:2615|Чашка кави
cook,cooking,fry|готувати їжу|приготування їжі|смажити|s:1f373|Їжа готується на сковороді
buy,shopping,go shopping|купувати|покупк|магазин|s:1f6cd|Пакети для покупок
pay|платити|s:1f4b3|Платіжна картка
drive|керувати автомобілем|s:1f697|Автомобіль
take the bus,catch a bus|автобус|s:1f68c|Автобус
watch TV|дивитися телевізор|s:1f4fa|Телевізор
take a shower|приймати душ|s:1f6bf|Душ
take a bath|приймати ванну|s:1f6c0|Людина приймає ванну
set the alarm,wake up,alarm clock|будильник|прокидатися|s:23f0|Будильник
clean,cleaning,clean the house,sweep|чистити|прибиран|прибирати|підмітати|s:1f9f9|Мітла для прибирання
draw,drawing,painting,paint|малювати|малювання|s:1f3a8|Палітра та пензлик
photography|фотограф|s:1f4f8|Фотоапарат зі спалахом
knitting|в'язання|в’язання|s:1f9f6|Клубок ниток зі спицями
sewing|шиття|s:1faa1|Голка з ниткою
dancing,dance|танц|s:1f483|Людина танцює
singing,sing along|спів|підспів|s:1f3a4|Мікрофон
listening to music,listen to music|слухання музики|слухати музику|s:1f3a7|Навушники
playing the guitar|гра на гітарі|s:1f3b8|Гітара
watching films|перегляд фільмів|s:1f3ac|Кінохлопавка
playing games,play a game|гра в ігр|грати в гру|s:1f3ae|Ігровий контролер
camping|намет|s:1f3d5|Намет серед дерев
hiking|піші походи|s:1f97e|Черевик для походів
swim,swimming|плавати|плавання|s:1f3ca|Людина пливе
cycling|велосипед|s:1f6b4|Людина їде велосипедом
skiing|лиж|s:26f7|Лижник
skating|ковзан|s:26f8|Ковзан
yoga|йога|s:1f9d8|Людина в позі для йоги
table tennis|настільний теніс|s:1f3d3|Ракетка й м'яч для настільного тенісу
badminton|бадмінтон|s:1f3f8|Ракетка та волан для бадмінтону
gym,exercise|спортзал|фізичн.*вправ|s:1f3cb|Людина піднімає штангу
win,victory,triumph,success,achievement,accomplishment,succeed|перемаг|перемог|тріумф|успіх|досягнен|досягати успіху|s:1f3c6|Кубок переможця
team|команда|s:1f465|Група людей
ball|м'яч|м’яч|s:26bd|М'яч
sunny|сонячн|s:2600|Сонце
rainy,it's raining|дощов|іде дощ|s:1f327|Дощова хмара
snowy,it's snowing|сніжн|іде сніг|s:1f328|Хмара зі снігом
wind,windy|вітер|вітрян|s:1f32c|Подих вітру
cloudy|хмарн|s:1f325|Сонце за хмарою
fog,foggy|туман|s:1f32b|Туман
storm|буря|шторм|s:26c8|Грозова хмара
temperature,fever|температур|гарячка|s:1f321|Термометр
wet|мокр|волог|s:1f4a6|Краплі води
oak|дуб|c:0:20|Дубова гілка з жолудями
nest|гніздо|s:1faba|Пташине гніздо
caterpillar|гусінь|гусениц|s:1f41b|Гусениця
coral|корал|s:1fab8|Корал
sailboat|вітрильник|s:26f5|Вітрильник
parasol|парасол|s:26f1|Пляжна парасоля
recycle|переробляти|s:267b|Знак перероблення
solar energy|сонячна енергія|s:2600|Сонце як джерело енергії
paper,sheet of paper|папір|аркуш паперу|s:1f4c4|Аркуш паперу
folder|папк|s:1f4c1|Папка
crayons|воскові олівці|s:1f58d|Восковий олівець
school bag|шкільна сумка|s:1f392|Шкільний рюкзак
textbook,dictionary|підручник|словник|s:1f4da|Книжки
music,song,melody|музик|пісн|мелод|s:1f3b5|Музична нота
rhythm,beat|ритм|ритмічн|s:1f3b6|Музичні ноти
speaker|динамік|колонк|s:1f50a|Динамік
piano|піаніно|фортепіано|s:1f3b9|Клавіші фортепіано
drums|ударні|барабан|s:1f941|Барабан
email|електронн.*пошт|електронний лист|s:1f4e7|Конверт електронної пошти
text message,send a message|текстове повідомлення|надіслати повідомлення|s:1f4ac|Текстове повідомлення
call,make a call,call a friend,answer the phone|дзвін|телефонувати|зателефонувати|дзвонити|відповісти на дзвінок|s:1f4de|Телефонна слухавка
signal,wi-fi|сигнал|вайфай|бездротов|s:1f4f6|Індикатор бездротового сигналу
password|пароль|s:1f512|Замок як символ захисту пароля
notification|сповіщення|s:1f514|Дзвінок сповіщення
medicine|ліки|s:1f48a|Пігулка
bandage|бинт|пов'язка|пов’язка|s:1fa79|Пластир
injury,wound,injured|травм|рана|s:1f915|Людина з пов'язкою на голові
nausea|нудота|s:1f922|Обличчя, якому нудить
a cold,flu|застуда|грип|s:1f927|Обличчя з носовою хустинкою
I feel unwell|погано почуваюся|s:1f912|Хворе обличчя з термометром
warning,danger,unsafe|попередження|небезпек|небезпеч|s:26a0|Знак небезпеки
fire extinguisher|вогнегасник|s:1f9ef|Вогнегасник
alarm,fire alarm|сигнал тривоги|сигналізація|s:1f6a8|Сигнальний маячок
season|пора року|s:learn-seasons|Чотири пори року
`.trim().split('\n');

const vocabularyPictures=new Map();
for(const row of vocabularyPictureRows){
  const fields=row.split('|'),names=fields.shift().split(','),alt=fields.pop(),source=fields.pop(),meaning=new RegExp(fields.join('|'),'iu');
  const [type,first,second]=source.split(':');
  const picture=type==='c'?{type:'cottage',picture:Number(first),cell:Number(second),alt}:{type:'svg',src:`images/vocabulary-folk/${first}.svg?v=20261022-detail`,alt};
  for(const name of names){const key=name.toLowerCase();if(!vocabularyPictures.has(key))vocabularyPictures.set(key,[]);vocabularyPictures.get(key).push({meaning,picture});}
}
function lessonIllustrations(word){
  const names=String(word.en).normalize('NFKC').toLowerCase().trim().split(/\s*(?:\/|—)\s*/);
  if(names.length>2)return [];
  const meanings=String(word.uk).split(/\s*—\s*/);
  const pictures=names.map((name,index)=>vocabularyPictures.get(name)?.find(item=>item.meaning.test(meanings.length===names.length?meanings[index]:String(word.uk)))?.picture);
  if(pictures.some(picture=>!picture))return [];
  return pictures.filter((picture,index)=>pictures.findIndex(other=>other.type===picture.type&&other.src===picture.src&&other.picture===picture.picture&&other.cell===picture.cell)===index);
}
