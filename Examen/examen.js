// Exercice notion de jointure

// Créer une nouvelle base donner bookstore
use bookstore

// Créez une collection categories et une collection books 
db.createCollection('categories')
db.categories.insertMany([
    { name : "Programmation"},
    { name : "SQL"},
    { name : "NoSQL"}
])

db.createCollection('books')
db.books.insertMany([
    { title : "Python" },
   { title : "JS" }, 
   { title : "PosgreSQL" }, 
   { title : "MySQL" }, 
   { title : "MongoDB" }
])

// 1.Faites un script JS afin d'associer chaque livre à sa catégorie en utilisant l'id de sa catégorie. Créez une propriété category_id dans la collection books.
const categories = db.categories.find({},{_id:1}).toArray();
console.log(categories);

db.books.updateOne(
    { title: "Python" },
    { $set: { category_id: categories[0]._id } }
  );
  
  db.books.updateOne(
    { title: "JS" },
    { $set: { category_id: categories[0]._id } }
  );
  
  db.books.updateOne(
    { title: "PosgreSQL" },
    { $set: { category_id: categories[1]._id } }
  );
  
  db.books.updateOne(
    { title: "MySQL" },
    { $set: { category_id: categories[1]._id } }
  );
  
  db.books.updateOne(
    { title: "MongoDB" },
    { $set: { category_id: categories[2]._id } }
  );

// 2.Puis faites une requête pour récupérer les livres dans la catégorie programmation.
  db.books.find(
    { category_id: db.categories.findOne(
        { name: "Programmation" })._id })

// 3.Combien de livre y a t il dans la catégorie NoSQL ?
db.books.find(
    { category_id: db.categories.findOne(
        { name: "NoSQL" })._id }).count()

// 4.Associez maintenant les livres ci-dessous aux catégories :
const newBooks = [
    { title : "Python & SQL"}, // programmation & SQL
    { title : "JS SQL ou NoSQL" }, // programmation
    { title : "Pandas & SQL & NoSQL"}, // SQL, NoSQL et programmation
    { title : "Modélisation des données"} // aucune catégorie
]

db.books.insertMany(newBooks)

db.books.updateOne(
    { title: "Python & SQL" },
    { $set: { category_id: [categories[0]._id, categories[1]._id] } }
);
  
db.books.updateOne(
  { title: "JS SQL ou NoSQL" },
  { $set: { category_id: [categories[0]._id] } }
);
  
db.books.updateOne(
  { title: "Pandas & SQL & NoSQL" },
  {
    $set: {
      category_id: [categories[0]._id, categories[1]._id, categories[2]._id],
    },
  }
);
  
db.books.updateOne(
  { title: "Modélisation des données" },
  { $unset: { category_id: "" } }
);

// 5.Récupérez tous les livres qui n'ont pas de catégorie
db.books.find({
    category_id: {$exists: false}
})

// Exercice tree structure Algorithmique recherche
//Créez la collection categoriestree contenant les documents suivants :
db.createCollection('categoriestree')
db.categoriestree.insertMany(
    [
        {
           _id: "Books",
           parent: null,
           name: "Informatique"
        },
        {
           _id: "Programming",
           parent: "Books",
           books: [
                 "Python apprendre",
                 "Pandas & Python",
                 "async/await JS & Python",
                 "JS paradigme objet",
                 "Anaconda"
           ]
        },
        {
           _id: "Database",
           parent: "Programming",
           books: [
                 "NoSQL & devenir expert avec la console",
                 "NoSQL drivers",
                 "SQL"
           ]
        },
        {
           _id: "MongoDB",
           parent: "Database",
           books: [
                 "Introduction à MongoDB",
                 "MongoDB aggrégation"
           ]
        }
     ]
)

// Exercice
db.categoriestree.find().forEach(function(doc) {
    db.categoriestree.updateOne(
       { _id: doc._id },
       {
          $addToSet: {
             ancestors: {
                $each: (() => {
                   const ancestors = [];
                   let parent = doc.parent;
                   while (parent !== null) {
                      const parentDoc = db.categoriestree.findOne({ _id: parent });
                      if (parentDoc) {
                         ancestors.push({ _id: parentDoc._id });
                         parent = parentDoc.parent;
                      } else {
                         parent = null;
                      }
                   }
                   return ancestors.reverse();
                })()
             }
          }
       }
    );
 });


 // Recherche & Développement - Collection Restaurants

 // 01 - Proposez une série de modifications structurelles de la base de données "ny". À faire en groupe.

 // - Décomposer la base de donnée en plusieurs collection :
 //             - Collection cuisine (pour le type de cuisine)
 //             - collection Borough (pour les quartier)
 //             - collection addresse 
//              - collection grades ou on stock le tableau de grades. On ajoute un grade_id aux documents
//                de la collection 'restaurants'. Si on recherche les grades d'un restaurant
 // - modifier les grades en assignant une note (number)


 // On crée la collection 'borough'
 db.createCollection('borough')
// On insere les nouvelles datas
 db.borough.insertMany([
    { _id: "Manhattan", name: "Manhattan" },
    { _id: "Brooklyn", name: "Brooklyn" },
    { _id: "Bronx", name: "Bronx" },
    { _id: "Queens", name: "Queens" },
    { _id: "Staten Island", name: "Staten Island" },
    { _id: "Missing", name: "Missing"}
  ]);
  
  // On stock toutes les data de la collection 'borough' dans un array
  const boroughs = db.borough.find().toArray();
  // On boucle sur le array pour set le borough_id avec le borough._id
  for (borough of boroughs) {
    db.restaurants.updateMany(
      { borough: borough._id },
      { $set: { borough_id: borough._id } }
    );
  }
// On vérifie que cela a fonctionner = Le number doit etre le meme que le nombre de la totalité du nombre de document
db.restaurants.find({
    borough_id: {$exists: true}
}).count()

// On supprime le champ 'borough' des docs de la collection restaurants
db.restaurants.updateMany(
    {},
    { $unset: { borough: ""}},
 )



// On regroupe les restaurants avec la clé $restaurant_id et un champ grades ou on pousse les valeur dans un tableau. Le out pour enregistrer le reultat dans une nouvelle collection
db.restaurants.aggregate([
 {
    $group: {
       _id: {$concat:["Restaurant ", "$restaurant_id"]},
       grades: { $push: "$grades" }
    }
 },
 {
    $out: "grades"
 }]
 )

 // test pour verifier que ca a fonctionné
 db.grades.find({
  _id: 'Restaurant 40803254'
 })

 // Suppression du champs grades des document de la collection "restaurants"
 db.restaurants.updateMany(
  {},
  { $unset: { grades: ""}},
)

// On regroupe les restaurants avec la clé $restaurant_id et un champ address ou on pousse les valeur dans un tableau. Le out pour enregistrer le reultat dans une nouvelle collection
db.restaurants.aggregate([
  {
     $group: {
        _id: {$concat:["Restaurant ", "$restaurant_id"]},
        address: { $push: "$address" }
     }
  },
  {
     $out: "addressRestaurant"
  }
])

// test pour verifier que ca a fonctionné
db.addressRestaurant.find({
  _id: 'Restaurant 40803254'
 })

 // Suppression du champs addresse des document de la collection "restaurants"
 db.restaurants.updateMany(
  {},
  { $unset: { address: ""}},
)