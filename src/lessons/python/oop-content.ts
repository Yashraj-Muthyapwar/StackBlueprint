import { type LessonContent } from "@/lessons/types";

export const OOP_TOPICS: Record<string, { title: string; slug: string; lessons: LessonContent[] }> = {
  oop: {
    title: "Object-Oriented Programming",
    slug: "oop",
    lessons: [
      {
        slug: "classes-and-objects",
        title: "Classes and Objects",
        subtitle: "Learn how Python classes and objects help you organize related data and behavior into reusable code.",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "As a program grows, managing separate variables and functions can become messy. Object-oriented programming, or OOP, helps you group related data and behavior into one structure.",
              "You will see this idea in web applications, banking systems, games, machine learning libraries, e-commerce platforms, and many other Python projects."
            ]
          },
          {
            kind: "animation",
            variant: "classes-and-objects",
            caption: "Grouping variables and functions into objects"
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "OOP organizes programs around objects. An object usually contains two things:",
              "- **Attributes**: Data that describes the object.",
              "- **Methods**: Actions the object can perform.",
              "A class defines what those objects should contain.",
              "Think of a class as a blueprint for a house. The blueprint describes the structure, but it is not a real house. Each house built from that blueprint is a separate object."
            ]
          },
          {
            kind: "prose",
            heading: "Step-by-step",
            body: [
              "### 1. Create a class",
              "Use the `class` keyword to define a class.",
            ]
          },
          {
            kind: "interactive-code",
            code: `class Car:\n    pass\n\nprint("Car class defined successfully!")`
          },
          {
            kind: "prose",
            body: [
              "`Car` is the class name.",
              "`pass` means there is nothing inside the class yet. Python allows the class to exist without giving it any behavior.",
              "Python class names usually follow **PascalCase**: `Car`, `BankAccount`, `ShoppingCart`."
            ]
          },
          {
            kind: "prose",
            body: [
              "### 2. Create objects from the class",
              "You create (or **instantiate**) an object by calling the class. The created object is called an **instance**."
            ]
          },
          {
            kind: "interactive-code",
            code: `class Car:\n    pass\n\ncar1 = Car()\ncar2 = Car()\n\nprint("car1:", car1)\nprint("car2:", car2)`
          },
          {
            kind: "prose",
            body: [
              "`car1` and `car2` are separate objects created from the same `Car` class.",
              "They follow the same class definition, but each object can store different information."
            ]
          },
          {
            kind: "prose",
            body: [
              "### 3. Add data with __init__()",
              "Most classes need some starting data. Python commonly uses the `__init__()` method to set that data when an object is created."
            ]
          },
          {
            kind: "interactive-code",
            code: `class Car:\n    def __init__(self, brand, speed):\n        self.brand = brand\n        self.speed = speed\n\ncar1 = Car("Toyota", 120)\ncar2 = Car("Ford", 140)\n\nprint(car1.brand)\nprint(car2.brand)`
          },
          {
            kind: "prose",
            body: [
              "`self.brand` and `self.speed` are **instance attributes**. They belong to a particular object.",
              "`self` refers to the object currently using the class."
            ]
          },
          {
            kind: "prose",
            body: [
              "### 4. Add behavior with methods",
              "A **method** is a **function** defined inside a class."
            ]
          },
          {
            kind: "interactive-code",
            code: `class Car:\n    def __init__(self, brand, speed):\n        self.brand = brand\n        self.speed = speed\n\n    def drive(self):\n        print(f"{self.brand} is driving.")\n\ncar1 = Car("Toyota", 120)\ncar1.drive()`
          },
          {
            kind: "prose",
            body: [
              "When you write `car1.drive()`, Python automatically passes the `car1` object as the `self` parameter.",
              "Behind the scenes, Python translates: `car1.drive()` → `Car.drive(car1)`.",
              "You will always use the shorter `car1.drive()` form, but this explains why `self` is required in the method definition!"
            ]
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "Imagine you are building an **online shopping system**. The store needs to keep track of many products.",
              "Every product has information such as a name and price. Products may also need actions such as displaying their details.",
              "You can represent this with a `Product` class:"
            ]
          },
          {
            kind: "interactive-code",
            code: `class Product:\n    def __init__(self, name, price):\n        self.name = name\n        self.price = price\n\n    def display_details(self):\n        print(f"{self.name}: \${self.price}")\n\n\nlaptop = Product("Laptop", 899)\nheadphones = Product("Headphones", 120)\n\nlaptop.display_details()\nheadphones.display_details()`
          },
          {
            kind: "prose",
            body: [
              "`Product` is the class. `laptop` and `headphones` are separate objects.",
              "Both products follow the same structure, but each object stores its own values. A real online store could create thousands of `Product` objects using the same class. Later, the class could also include actions such as applying discounts, updating prices, or checking stock."
            ]
          },
          {
            kind: "callout",
            tone: "warn",
            title: "Common mistakes",
            body: "- **Forgetting self**: Instance methods normally need `self` as their first parameter.\n- **Using brand = brand**: Use `self.brand = brand` when the value should belong to the object.\n- **Confusing a class with an object**: `Car` is the class. `Car(\"Toyota\", 120)` creates an object.\n- **Forgetting method parentheses**: `car1.drive` refers to the method. `car1.drive()` runs it."
          },
          {
            kind: "takeaways",
            items: [
              "A class defines the structure and behavior of objects.",
              "An object is an individual instance created from a class.",
              "Attributes store data about an object.",
              "Methods define what an object can do.",
              "`__init__()` sets up an object's starting data.",
              "`self` refers to the current object."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "oop-basics-1",
                question: "What is a class in Python?",
                options: [
                  "A variable that stores a list of numbers",
                  "A blueprint used for creating objects",
                  "A function that runs automatically",
                  "A type of loop for iterating over data"
                ],
                correctIndex: 1,
                explanation: "A class acts as a blueprint or template. It defines the structure (attributes) and behavior (methods) that all objects created from it will have."
              },
              {
                id: "oop-basics-2",
                question: "What is the primary purpose of the `__init__()` method?",
                options: [
                  "To delete an object from memory",
                  "To set up an object's starting data when it is created",
                  "To print text to the screen",
                  "To stop a program from running"
                ],
                correctIndex: 1,
                explanation: "The `__init__()` method is called automatically when an object is instantiated. It is used to initialize the object's starting attributes."
              },
              {
                id: "oop-basics-3",
                question: "In the method definition `def drive(self):`, what does `self` refer to?",
                options: [
                  "The class itself",
                  "The `drive` function",
                  "The specific object that is currently calling the method",
                  "A built-in Python module"
                ],
                correctIndex: 2,
                explanation: "`self` is a reference to the current instance of the class. It allows the object to access its own attributes and other methods."
              },
              {
                id: "oop-basics-4",
                question: "Write the code to create a `BankAccount` class with an `__init__` method that accepts `owner` and `balance` parameters and assigns them to instance attributes.",
                interactiveCode: true,
                initialCode: "# Write your class here:\n\n",
                testCode: "acc = BankAccount('Alice', 100)\nprint(acc.owner)\nprint(acc.balance)",
                expectedOutput: "Alice\n100",
                explanation: "`self` correctly references the instance, and assigning `self.owner` and `self.balance` ensures those values belong to each specific `BankAccount` instance."
              },
              {
                id: "oop-basics-5",
                question: "If we define a class `Car` and create two objects `car1 = Car()` and `car2 = Car()`, which of the following is true?",
                options: [
                  "`car1` and `car2` share the exact same identity in memory.",
                  "`car1` and `car2` are separate, independent instances of the `Car` class.",
                  "We cannot create more than one object from a single class.",
                  "`car2` will automatically overwrite `car1`."
                ],
                correctIndex: 1,
                explanation: "Classes act as blueprints. You can instantiate as many objects as you want from a single class, and each object will be a completely independent instance."
              }
            ]
          }
        ]
      },
      {
        slug: "instance-and-class-attributes",
        title: "Instance and Class Attributes",
        subtitle: "Learn when data should belong to one object and when it should be shared by every object in a class.",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "Not every piece of data should be stored the same way.",
              "Some values belong to one specific object, while other values should be shared across every object created from a class. Python handles these using **instance attributes** and **class attributes**."
            ]
          },
          {
            kind: "animation",
            variant: "instance-and-class-attributes",
            caption: "Instance vs Class Attributes in Action"
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "An **instance attribute** belongs to one specific object.",
              "A **class attribute** belongs to the class itself and is shared by its objects.",
              "The company name is the same for everyone, so it can be stored once as a **class attribute**.",
              "Each employee has a different name and salary, so those values should be **instance attributes**."
            ]
          },
          {
            kind: "prose",
            heading: "Step-by-step",
            body: [
              "### 1. Create instance attributes",
              "Instance attributes are usually created inside `__init__()` using `self`."
            ]
          },
          {
            kind: "interactive-code",
            code: `class Employee:\n    def __init__(self, name, salary):\n        self.name = name\n        self.salary = salary\n\nemployee1 = Employee("Maya", 70000)\nemployee2 = Employee("Leo", 82000)\n\nprint(employee1.name)\nprint(employee2.name)`
          },
          {
            kind: "prose",
            body: [
              "Each object stores its own values. Changing one employee does not change the other."
            ]
          },
          {
            kind: "interactive-code",
            code: `class Employee:\n    def __init__(self, name, salary):\n        self.name = name\n        self.salary = salary\n\nemployee1 = Employee("Maya", 70000)\nemployee2 = Employee("Leo", 82000)\n\nemployee1.salary = 75000\nprint(employee1.salary)\nprint(employee2.salary)`
          },
          {
            kind: "prose",
            body: [
              "### 2. Create a class attribute",
              "A class attribute is defined inside the class but outside methods such as `__init__()`."
            ]
          },
          {
            kind: "interactive-code",
            code: `class Employee:\n    company = "Stack Blueprint"\n\n    def __init__(self, name, salary):\n        self.name = name\n        self.salary = salary\n\nemployee1 = Employee("Maya", 70000)\nemployee2 = Employee("Leo", 82000)\n\nprint(employee1.company)\nprint(employee2.company)\n\n# Python can also access the value directly through the class:\nprint(Employee.company)`
          },
          {
            kind: "prose",
            body: [
              "This makes sense because `company` belongs to `Employee`, not to one particular employee."
            ]
          },
          {
            kind: "prose",
            body: [
              "### 3. Know which one to use"
            ]
          },
          {
            kind: "prose",
            body: [
              "Ask one question:",
              "**Should every object have its own value, or should the value be shared?**",
              "Use an **instance attribute** when the ==value can differ between objects.==",
              "Examples: `name`, `email`, `balance`, `price`, and `speed`."
            ]
          },
          {
            kind: "prose",
            body: [
              "Use a **class attribute** when the ==value describes the class as a whole or should have one shared default.==",
              "Examples: `company_name`, `school_name`, `tax_rate`, and `species`."
            ]
          },
          {
            kind: "interactive-code",
            code: `class BankAccount:\n    bank_name = "Blue Bank"\n\n    def __init__(self, owner, balance):\n        self.owner = owner\n        self.balance = balance\n\n\nacc1 = BankAccount("Alice", 1000)\nacc2 = BankAccount("Bob", 2500)\n\nprint(f"{acc1.owner}: \${acc1.balance} ({acc1.bank_name})")\nprint(f"{acc2.owner}: \${acc2.balance} ({acc2.bank_name})")`
          },
          {
            kind: "prose",
            body: [
              "`owner` and `balance` belong to individual accounts.",
              "`bank_name` is shared by every account."
            ]
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "Imagine you are building the product system for an online store.",
              "Every product has its own name, price, and stock quantity. However, every product currently uses the same sales tax rate."
            ]
          },
          {
            kind: "interactive-code",
            code: `class Product:\n    tax_rate = 0.0825\n\n    def __init__(self, name, price, stock):\n        self.name = name\n        self.price = price\n        self.stock = stock\n\n    def price_with_tax(self):\n        return round(self.price * (1 + Product.tax_rate),2)\n\nlaptop = Product("Laptop", 900, 12)\nheadphones = Product("Headphones", 100, 35)\n\nprint(laptop.price_with_tax())\nprint(headphones.price_with_tax())`
          },
          {
            kind: "prose",
            body: [
              "Each product has different instance data (its `name`, `price`, and `stock`).",
              "But both use the shared class attribute: `Product.tax_rate = 0.0825`",
              "If the store changes its tax rate, you can update the shared value:",
              "`Product.tax_rate = 0.0925`",
              "Both products will now use the new rate the next time `price_with_tax()` runs."
            ]
          },
          {
            kind: "callout",
            tone: "warn",
            title: "Common mistakes",
            body: "- **Putting every value in the class**: Object-specific data such as a customer's name or account balance should normally be instance attributes.\n- **Treating class attributes as independent values**: A class attribute is shared unless an object creates its own attribute with the same name.\n- **Changing a shared value through one object**: Prefer `ClassName.attribute` when intentionally changing class-wide data because it makes the intent clearer."
          },
          {
            kind: "takeaways",
            items: [
              "Instance attributes belong to individual objects.",
              "Class attributes belong to the class and are shared across its objects.",
              "Instance attributes are commonly created with `self` inside `__init__()`.",
              "Class attributes are defined directly inside the class.",
              "Choose between them by asking whether the value should vary between objects."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "attr-vs-class-1",
                question: "Is `student_name` more likely to be an instance attribute or a class attribute?",
                options: [
                  "Instance attribute",
                  "Class attribute"
                ],
                correctIndex: 0,
                explanation: "Every student has their own unique name, so it belongs to the individual object."
              },
              {
                id: "attr-vs-class-2",
                question: "Should a shared `school_name` normally be an instance attribute or a class attribute?",
                options: [
                  "Instance attribute",
                  "Class attribute"
                ],
                correctIndex: 1,
                explanation: "Since the school name is shared across all students, it makes sense to store it once as a class attribute."
              },
              {
                id: "attr-vs-class-3",
                question: "In a class `Car` with `wheels = 4` and `self.brand = brand`, which attribute is shared across all cars?",
                options: [
                  "brand",
                  "wheels",
                  "Both of them",
                  "Neither of them"
                ],
                correctIndex: 1,
                explanation: "`wheels` is defined at the class level, making it a class attribute shared by all cars. `brand` is defined on `self`, meaning it's an instance attribute."
              },
              {
                id: "attr-vs-class-4",
                question: "Write the code to create a `Dog` class with a class attribute `species` set to `\"Canis\"`, and an `__init__` method that assigns an instance attribute `name`.",
                interactiveCode: true,
                initialCode: "# Write your class here:\n\n",
                testCode: "dog = Dog('Buddy')\nprint(Dog.species)\nprint(dog.name)",
                expectedOutput: "Canis\nBuddy",
                explanation: "`species` should be defined directly inside the class, while `self.name` is assigned inside the `__init__` method."
              },
              {
                id: "attr-vs-class-5",
                question: "If you change a class attribute directly on the class (e.g., `Car.wheels = 3`), what happens?",
                options: [
                  "Only new objects created after the change will have 3 wheels.",
                  "All existing objects and new objects will share the new value of 3 wheels.",
                  "Python will throw an error because class attributes cannot be changed.",
                  "Existing objects are deleted from memory."
                ],
                correctIndex: 1,
                explanation: "Class attributes are shared by reference. Changing the value on the class itself updates it for all instances that share that attribute."
              }
            ]
          }
        ]
      },
      {
        slug: "types-of-methods",
        title: "Types of Methods",
        subtitle: "Coming soon",
        sections: []
      },
      {
        slug: "encapsulation",
        title: "Encapsulation",
        subtitle: "Coming soon",
        sections: []
      },
      {
        slug: "inheritance",
        title: "Inheritance",
        subtitle: "Coming soon",
        sections: []
      },
      {
        slug: "polymorphism",
        title: "Polymorphism",
        subtitle: "Coming soon",
        sections: []
      },
      {
        slug: "abstraction",
        title: "Abstraction",
        subtitle: "Coming soon",
        sections: []
      },
      {
        slug: "composition",
        title: "Composition",
        subtitle: "Coming soon",
        sections: []
      },
      {
        slug: "special-methods",
        title: "Special Methods",
        subtitle: "Coming soon",
        sections: []
      }
    ]
  }
};
