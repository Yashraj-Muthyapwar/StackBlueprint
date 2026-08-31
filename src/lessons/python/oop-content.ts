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
        title: "Instance, Class, and Static Methods",
        subtitle: "The Three Types of Methods",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "Methods define what objects and classes can do. But not every method needs access to the same kind of data.",
              "Python gives you three common method types: **instance methods**, **class methods**, and **static methods**. Choosing the right one makes your classes easier to understand and maintain."
            ]
          },
          {
            kind: "animation",
            variant: "types-of-methods",
            caption: "Method Types"
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "The difference between the three method types comes down to what information the method needs.",
              "An **instance method** works with object-specific data.",
              "A **class method** works with class-level data.",
              "A **static method** belongs logically to the class, but does not need access to either an object or the class itself.",
              "### 1. Use an instance method for object data",
              "An instance method is the method type you have already been using. Its first parameter is usually `self`."
            ]
          },
          {
            kind: "interactive-code",
            code: `class Product:\n    def __init__(self, name, price):\n        self.name = name\n        self.price = price\n\n    def display_details(self):\n        print(f"{self.name}: \${self.price}")\n\nlaptop = Product("Laptop", 900)\nlaptop.display_details()`
          },
          {
            kind: "prose",
            body: [
              "`display_details()` needs the current product's `name` and `price`, so it should be an instance method.",
              "When you call `laptop.display_details()`, Python automatically passes `laptop` as `self`.",
              "### 2. Use a class method for class-level behavior",
              "A class method works with the class rather than one specific object.",
              "Add `@classmethod` above the method and use `cls` as the first parameter."
            ]
          },
          {
            kind: "interactive-code",
            code: `class Product:\n    tax_rate = 0.08\n\n    @classmethod\n    def update_tax_rate(cls, new_rate):\n        cls.tax_rate = new_rate\n\nProduct.update_tax_rate(0.09)\nprint(Product.tax_rate)`
          },
          {
            kind: "prose",
            body: [
              "`cls` refers to the class that called the method. This is similar to how `self` refers to an object.",
              "Use class methods when the behavior needs class attributes or should affect the class as a whole.",
              "### 3. Use a static method for related utility logic",
              "Sometimes a function belongs conceptually to a class but does not need any object or class data.",
              "Use `@staticmethod` for this case."
            ]
          },
          {
            kind: "interactive-code",
            code: `class Product:\n    @staticmethod\n    def is_valid_price(price):\n        return price >= 0\n\nprint(Product.is_valid_price(100))\nprint(Product.is_valid_price(-20))`
          },
          {
            kind: "prose",
            body: [
              "`is_valid_price()` only checks the value it receives. It does not use `self` or `cls`.",
              "That makes it a good fit for a static method.",
              "### 4. Choose the method based on what it needs",
              "A simple decision process is:"
            ]
          },
          {
            kind: "table",
            headers: ["Method", "Needs", "First parameter"],
            rows: [
              ["**Instance method**", "Object data", "`self`"],
              ["**Class method**", "Class data", "`cls`"],
              ["**Static method**", "Neither", "None"]
            ]
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "Imagine you are building the product system for an online store. The store needs to:",
              "1. calculate the final price of one product",
              "2. update a tax rate shared by every product",
              "3. check whether a supplied price is valid",
              "These responsibilities fit the three method types naturally."
            ]
          },
          {
            kind: "interactive-code",
            code: `class Product:\n    tax_rate = 0.08\n\n    def __init__(self, name, price):\n        self.name = name\n        self.price = price\n\n    def final_price(self):\n        return self.price * (1 + Product.tax_rate)\n\n    @classmethod\n    def update_tax_rate(cls, new_rate):\n        cls.tax_rate = new_rate\n\n    @staticmethod\n    def is_valid_price(price):\n        return price >= 0\n\nlaptop = Product("Laptop", 1000)\n\n# Instance method works with specific laptop\nprint(laptop.final_price())\n\n# Class method changes shared info\nProduct.update_tax_rate(0.10)\nprint(laptop.final_price())\n\n# Static method performs independent check\nprint(Product.is_valid_price(500))`
          },
          {
            kind: "callout",
            tone: "warn",
            title: "Common mistakes",
            body: "- **Using `self` inside a class method**: Class methods receive `cls`, not an individual object.\n- **Forgetting the decorator**: `@classmethod` and `@staticmethod` tell Python how the method should behave.\n- **Making every helper a static method**: Use a static method only when the logic belongs conceptually with the class.\n- **Using a class method for object-specific data**: If the method needs `self.price` or `self.name`, it should usually be an instance method."
          },
          {
            kind: "takeaways",
            items: [
              "Instance methods use `self` and work with individual objects.",
              "Class methods use `cls` and work with the class or shared class data.",
              "Static methods need neither `self` nor `cls`.",
              "Use `@classmethod` and `@staticmethod` to define the last two types.",
              "Choose the method type based on what data the behavior actually needs."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "types-methods-1",
                question: "Which method type should you use to update one customer's account balance?",
                options: [
                  "Instance method",
                  "Class method",
                  "Static method"
                ],
                correctIndex: 0,
                explanation: "Updating one customer's account requires object-specific data, so you should use an instance method."
              },
              {
                id: "types-methods-2",
                question: "Which method type should you use to change a shared interest rate for all accounts?",
                options: [
                  "Instance method",
                  "Class method",
                  "Static method"
                ],
                correctIndex: 1,
                explanation: "Changing a shared value (like a global interest rate) affects the class as a whole, which is what a class method is for."
              },
              {
                id: "types-methods-3",
                question: "Which method type could check whether an account number has the correct length without accessing any object data?",
                options: [
                  "Instance method",
                  "Class method",
                  "Static method"
                ],
                correctIndex: 2,
                explanation: "If it doesn't need to read any object or class data, and just validates an input, it should be a static method."
              },
              {
                id: "types-methods-4",
                question: "What is the difference between `self` and `cls`?",
                options: [
                  "`self` is used for global variables, `cls` is for local variables.",
                  "`self` refers to an individual object, while `cls` refers to the class itself.",
                  "`self` is used in static methods, `cls` is used in instance methods.",
                  "They are completely identical in functionality."
                ],
                correctIndex: 1,
                explanation: "`self` provides access to the current instance (object), whereas `cls` provides access to the class itself."
              },
              {
                id: "types-methods-5",
                question: "Complete the `User` class by defining an instance method `get_email`, a class method `get_company`, and a static method `is_valid_email`.",
                interactiveCode: true,
                initialCode: "class User:\n    company = 'TechCorp'\n\n    def __init__(self, email):\n        self.email = email\n\n    # 1. Define get_email() returning self.email\n\n\n    # 2. Define get_company() returning cls.company\n\n\n    # 3. Define is_valid_email(email) checking if '@' is in email\n\n",
                testCode: "u = User('test@example.com')\nprint(u.get_email())\nprint(User.get_company())\nprint(User.is_valid_email('hello'))\nprint(User.is_valid_email('a@b.com'))",
                expectedOutput: "test@example.com\nTechCorp\nFalse\nTrue",
                explanation: "An instance method uses `self`, a class method uses `@classmethod` and `cls`, and a static method uses `@staticmethod` and just the argument."
              }
            ]
          }
        ]
      },
      {
        slug: "encapsulation",
        title: "Encapsulation",
        subtitle: "Protecting Object Data",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "Objects often contain data that should not be changed carelessly.",
              "For example, a bank account balance should not become negative because another part of the program directly assigns an invalid value. Encapsulation helps you keep data and the rules for changing that data inside the class."
            ]
          },
          {
            kind: "animation",
            variant: "encapsulation",
            caption: "Encapsulation and Data Protection"
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "Encapsulation means keeping related data and behavior together while controlling how the data is accessed or modified.",
              "Instead of letting outside code change important attributes directly, the class can provide methods or properties that apply rules first.",
              "Python does not enforce access restrictions in exactly the same way as languages such as Java or C++. Instead, it uses naming conventions and features such as properties.",
              "### 1. Understand public attributes",
              "A normal Python attribute is public."
            ]
          },
          {
            kind: "interactive-code",
            code: `class BankAccount:\n    def __init__(self, owner, balance):\n        self.owner = owner\n        self.balance = balance\n\naccount = BankAccount("Maya", 1000)\n\n# Outside code can read or change balance directly\naccount.balance = -500\nprint(account.balance)`
          },
          {
            kind: "prose",
            body: [
              "Python accepts the change even though a negative balance might violate the rules of your application.",
              "This is where controlled access becomes useful.",
              "### 2. Use a leading underscore for internal attributes",
              "Python developers often use a single underscore to show that an attribute is intended for internal use."
            ]
          },
          {
            kind: "interactive-code",
            code: `class BankAccount:\n    def __init__(self, owner, balance):\n        self.owner = owner\n        # The underscore means internal use\n        self._balance = balance\n\naccount = BankAccount("Maya", 1000)\naccount._balance = -500\nprint(account._balance)`
          },
          {
            kind: "prose",
            body: [
              "The underscore in `_balance` communicates: *\"This is an internal implementation detail. Avoid changing it directly.\"*",
              "It does not make the attribute physically inaccessible (as seen in the code above). The underscore is a **convention** that asks other programmers to treat the value carefully.",
              "### 3. Control changes with methods",
              "Instead of changing `_balance` directly, provide methods that enforce your rules."
            ]
          },
          {
            kind: "interactive-code",
            code: `class BankAccount:\n    def __init__(self, owner, balance):\n        self.owner = owner\n        self._balance = balance\n\n    def deposit(self, amount):\n        if amount > 0:\n            self._balance += amount\n\n    def withdraw(self, amount):\n        if 0 < amount <= self._balance:\n            self._balance -= amount\n\naccount = BankAccount("Maya", 1000)\naccount.deposit(200)\naccount.withdraw(300)\nprint(account._balance)`
          },
          {
            kind: "prose",
            body: [
              "Now outside code can interact with the account safely. The class decides what counts as a valid deposit or withdrawal.",
              "### 4. Use a property for controlled attribute access",
              "Sometimes you want users of the class to read an attribute naturally while still controlling what happens behind the scenes. Python provides the `@property` decorator for this."
            ]
          },
          {
            kind: "interactive-code",
            code: `class BankAccount:\n    def __init__(self, owner, balance):\n        self.owner = owner\n        self._balance = balance\n\n    @property\n    def balance(self):\n        return self._balance\n\naccount = BankAccount("Maya", 1000)\n# We read it like an attribute, but it calls the method\nprint(account.balance)`
          },
          {
            kind: "prose",
            body: [
              "It looks like normal attribute access, but Python actually calls the `balance()` method.",
              "Because no setter has been defined, this assignment is **not** allowed: `account.balance = -500`",
              "### 5. Add a setter when controlled assignment is needed",
              "A property can also define rules for assigning a new value."
            ]
          },
          {
            kind: "interactive-code",
            code: `class Product:\n    def __init__(self, name, price):\n        self.name = name\n        self._price = price\n\n    @property\n    def price(self):\n        return self._price\n\n    @price.setter\n    def price(self, value):\n        if value >= 0:\n            self._price = value\n        else:\n            print("Error: Price cannot be negative.")\n\nproduct = Product("Laptop", 900)\nproduct.price = 850\nprint(product.price)\n\nproduct.price = -100\nprint(product.price)`
          },
          {
            kind: "prose",
            body: [
              "The setter checks the value before updating `_price`.",
              "The important part is that the validation rule lives inside `Product`. Other parts of the application do not need to remember how to validate a product price every time they change it."
            ]
          },
          {
            kind: "callout",
            tone: "warn",
            title: "Common mistakes",
            body: "- **Thinking `_attribute` is private**: A leading underscore is a convention. Python still allows direct access.\n- **Using properties for every attribute**: Use them when you need validation, calculated values, or controlled access. Normal attributes are fine for simple data.\n- **Putting validation outside the class**: If the rule belongs to the object's data, keeping it inside the class makes the rule easier to maintain.\n- **Creating unnecessary getters and setters**: Python properties let you keep natural attribute syntax without writing Java-style methods such as `get_price()` for every value."
          },
          {
            kind: "takeaways",
            items: [
              "Encapsulation keeps data and the rules for working with that data inside a class.",
              "A leading underscore marks an attribute as intended for internal use.",
              "Methods can control how object state changes.",
              "`@property` provides controlled access while keeping normal attribute syntax.",
              "Property setters can validate values before storing them."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "encapsulation-1",
                question: "What does encapsulation help you control?",
                options: [
                  "The memory usage of the class instances.",
                  "How the data inside a class is accessed and modified.",
                  "The speed at which the methods execute.",
                  "How many classes can inherit from the base class."
                ],
                correctIndex: 1,
                explanation: "Encapsulation groups data and behavior together, allowing you to define rules for how that data can be accessed or changed."
              },
              {
                id: "encapsulation-2",
                question: "Does `_balance` prevent outside code from accessing the attribute?",
                options: [
                  "Yes, it makes the attribute completely hidden.",
                  "No, it is just a naming convention that indicates it should be treated as internal.",
                  "Yes, it throws an error if accessed directly.",
                  "No, but it makes the attribute read-only."
                ],
                correctIndex: 1,
                explanation: "Python does not strictly enforce private attributes. The leading underscore is a convention used by programmers."
              },
              {
                id: "encapsulation-3",
                question: "What does the `@property` decorator allow you to do?",
                options: [
                  "Define an attribute that belongs to the class instead of the instance.",
                  "Prevent the class from being inherited.",
                  "Access a method like it was a regular attribute, hiding the underlying logic.",
                  "Automatically generate setter methods."
                ],
                correctIndex: 2,
                explanation: "`@property` turns a method into a \"getter\", so you can call `obj.value` instead of `obj.value()`."
              },
              {
                id: "encapsulation-4",
                question: "Why is it generally better to put validation inside a property setter instead of checking values before assignment in outside code?",
                options: [
                  "Because it is required by the Python language specification.",
                  "Because it keeps the validation logic centralized in the class, meaning outside code doesn't have to remember the rules.",
                  "Because it makes the program run significantly faster.",
                  "Because setters are the only way to assign values in Python."
                ],
                correctIndex: 1,
                explanation: "Centralizing logic inside the class (encapsulation) prevents duplicate code and ensures rules are consistently applied everywhere."
              },
              {
                id: "encapsulation-5",
                question: "Add validation so the following `Person` class does not allow a negative age. Create a property `age` and a setter that assigns the value if it's `>= 0`, or prints 'Invalid age' if negative.",
                interactiveCode: true,
                initialCode: "class Person:\n    def __init__(self, name, age):\n        self.name = name\n        self._age = age\n\n    # 1. Add the @property decorator and age getter method\n\n\n    # 2. Add the @age.setter decorator and age setter method\n\n",
                testCode: "p = Person('Alice', 25)\nprint(p.age)\np.age = 30\nprint(p.age)\np.age = -5\nprint(p.age)",
                expectedOutput: "25\n30\nInvalid age\n30",
                explanation: "The `@property` defines the getter, and `@age.setter` defines the setter where you perform the validation check before modifying `self._age`."
              }
            ]
          }
        ]
      },
      {
        slug: "inheritance",
        title: "Inheritance",
        subtitle: "Reusing and Extending Behavior",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "Many objects share common behavior but still need their own specialized features.",
              "Inheritance lets you place shared logic in one class and reuse it in related classes. This reduces repeated code and gives your program a clearer structure."
            ]
          },
          {
            kind: "animation",
            variant: "inheritance",
            caption: "Class Inheritance Flow"
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "Inheritance allows one class to build on another class.",
              "The existing class is commonly called the **parent class** or **base class**. The new class is called the **child class** or **subclass**.",
              "**Example:** `Developer` automatically inherits all attributes and methods from `Employee`, so you do not need to rewrite them."
            ]
          },
          {
            kind: "prose",
            heading: "Types of inheritance",
            body: [
              "Python supports several inheritance patterns depending on how classes relate to one another:"
            ]
          },
          {
            kind: "animation",
            variant: "inheritance-types",
            caption: "Types of Inheritance"
          },
          {
            kind: "prose",
            body: [
              "### 1. Single inheritance",
              "Single inheritance occurs when one child class inherits from one parent class."
            ]
          },
          {
            kind: "interactive-code",
            code: "class Employee:\n    def introduce(self):\n        print(\"I am an employee.\")\n\nclass Developer(Employee):\n    def write_code(self):\n        print(\"I am writing code.\")\n\ndeveloper = Developer()\ndeveloper.introduce()\ndeveloper.write_code()\n\n# Inspect the Method Resolution Order (MRO)\nprint(Developer.mro())"
          },
          {
            kind: "prose",
            body: [
              "Now `Developer` can use both its inherited method and its own method.",
              "This is the simplest and most common type of inheritance.",
              "### 2. Multiple inheritance",
              "Multiple inheritance occurs when one child class inherits from more than one parent class."
            ]
          },
          {
            kind: "interactive-code",
            code: "class Writer:\n    def write(self):\n        print(\"Writing content.\")\n\n\nclass Speaker:\n    def speak(self):\n        print(\"Speaking to an audience.\")\n\n\nclass Presenter(Writer, Speaker):\n    pass\n\n\n# Now `Presenter` inherits methods from both parent classes:\n\npresenter = Presenter()\n\npresenter.write()\npresenter.speak()\n\n# Inspect the Method Resolution Order (MRO)\nprint(Presenter.mro()) "
          },
          {
            kind: "prose",
            body: [
              "Multiple inheritance can be useful when a class genuinely combines behaviors from different sources. However, it can become confusing if parent classes define methods with the same name.",
              "Python uses the **method resolution order**, or MRO, to decide which method to use first. You can inspect the MRO with `print(Presenter.mro())`.",
              "### 3. Multilevel inheritance",
              "Multilevel inheritance occurs when a class inherits from a class that already inherits from another class."
            ]
          },
          {
            kind: "interactive-code",
            code: "class Vehicle:\n    def move(self):\n        print(\"Vehicle is moving.\")\n\nclass Car(Vehicle):\n    def drive(self):\n        print(\"Car is driving.\")\n\nclass ElectricCar(Car):\n    def charge(self):\n        print(\"Electric car is charging.\")\n\nelectric_car = ElectricCar()\nelectric_car.move()\nelectric_car.drive()\nelectric_car.charge()\n\n# Inspect the Method Resolution Order (MRO)\nprint(ElectricCar.mro())"
          },
          {
            kind: "prose",
            body: [
              "`ElectricCar` can use methods from both `Car` and `Vehicle`. Each level adds more specialized behavior.",
              "### 4. Hierarchical inheritance",
              "Hierarchical inheritance occurs when multiple child classes inherit from the same parent class."
            ]
          },
          {
            kind: "interactive-code",
            code: "class Employee:\n    def introduce(self):\n        print(\"I am an employee.\")\n\nclass Developer(Employee):\n    def write_code(self):\n        print(\"Writing code.\")\n\nclass Designer(Employee):\n    def create_design(self):\n        print(\"Creating a design.\")\n\ndeveloper = Developer()\ndesigner = Designer()\ndeveloper.introduce()\ndeveloper.write_code()\ndesigner.introduce()\ndesigner.create_design()\n\n# Inspect the Method Resolution Order (MRO)\nprint(Developer.mro())\nprint(Designer.mro())"
          },
          {
            kind: "prose",
            body: [
              "Both child classes inherit `introduce()`. This is useful when several classes share a common foundation but need different specialized behavior.",
              "### 5. Hybrid inheritance",
              "Hybrid inheritance is a combination of two or more types of inheritance. For example, combining hierarchical and multiple inheritance:"
            ]
          },
          {
            kind: "interactive-code",
            code: "class Employee:\n    def introduce(self):\n        print(\"I am an employee.\")\n\nclass Developer(Employee):\n    def write_code(self):\n        print(\"Writing code.\")\n\nclass Designer(Employee):\n    def create_design(self):\n        print(\"Creating a design.\")\n\nclass TeamLead(Developer, Designer):\n    def manage_team(self):\n        print(\"Managing the team.\")\n\nteam_lead = TeamLead()\nteam_lead.introduce()\nteam_lead.write_code()\nteam_lead.create_design()\nteam_lead.manage_team()\n\n# Inspect the Method Resolution Order (MRO)\nprint(TeamLead.mro())"
          },
          {
            kind: "prose",
            body: [
              "`TeamLead` inherits from both `Developer` and `Designer`. Through those classes, it also receives behavior from `Employee`.",
              "Hybrid inheritance can model complex relationships, but it should be used carefully. Complex inheritance trees can make code harder to understand and maintain."
            ]
          },
          {
            kind: "prose",
            heading: "Step-by-step",
            body: [
              "### 1. Create a parent class",
              "Start with a class that contains behavior shared by several related objects."
            ]
          },
          {
            kind: "interactive-code",
            code: "class Employee:\n    def __init__(self, name):\n        self.name = name\n\n    def introduce(self):\n        print(f\"Hi, I'm {self.name}.\")\n\nemployee = Employee(\"Maya\")\nemployee.introduce()"
          },
          {
            kind: "prose",
            body: [
              "This class will act as the parent.",
              "### 2. Create a child class",
              "To inherit from another class, place the parent class name inside parentheses."
            ]
          },
          {
            kind: "interactive-code",
            code: "class Employee:\n    def __init__(self, name):\n        self.name = name\n\n    def introduce(self):\n        print(f\"Hi, I'm {self.name}.\")\n\nclass Developer(Employee):\n    pass\n\ndeveloper = Developer(\"Leo\")\nprint(developer.name)\ndeveloper.introduce()"
          },
          {
            kind: "prose",
            body: [
              "`Developer` now inherits from `Employee`.",
              "Python looks in `Developer` first. If it does not find the requested method there, it can look in its parent class.",
              "### 3. Add behavior specific to the child",
              "A child class can add its own attributes and methods."
            ]
          },
          {
            kind: "interactive-code",
            code: "class Employee:\n    def __init__(self, name):\n        self.name = name\n\n    def introduce(self):\n        print(f\"Hi, I'm {self.name}.\")\n\nclass Developer(Employee):\n    def write_code(self):\n        print(f\"{self.name} is writing code.\")\n\ndeveloper = Developer(\"Leo\")\ndeveloper.introduce()\ndeveloper.write_code()"
          },
          {
            kind: "prose",
            body: [
              "The child class extends the parent without copying its existing code.",
              "### 4. Extend initialization with `super()`",
              "Sometimes the child needs extra data. Suppose every employee has a name, but developers also have a programming language."
            ]
          },
          {
            kind: "interactive-code",
            code: "class Employee:\n    def __init__(self, name):\n        self.name = name\n\nclass Developer(Employee):\n    def __init__(self, name, language):\n        super().__init__(name)\n        self.language = language\n\ndeveloper = Developer(\"Leo\", \"Python\")\nprint(developer.name)\nprint(developer.language)"
          },
          {
            kind: "prose",
            body: [
              "`super()` gives you access to methods from the parent class.",
              "Here, `super().__init__(name)` runs the parent's `__init__()` method and sets `self.name = name`. Then the child adds its own attribute: `self.language = language`.",
              "### 5. Override inherited behavior",
              "A child class can replace an inherited method with its own version. This is called **method overriding**."
            ]
          },
          {
            kind: "interactive-code",
            code: "class Employee:\n    def work(self):\n        print(\"Employee is working.\")\n\nclass Developer(Employee):\n    def work(self):\n        print(\"Developer is writing code.\")\n\nemployee = Employee()\ndeveloper = Developer()\n\nemployee.work()\ndeveloper.work()"
          },
          {
            kind: "prose",
            body: [
              "Both classes have a `work()` method, but each provides behavior appropriate to that class."
            ]
          },
          {
            kind: "prose",
            heading: "Choosing the right type of inheritance",
            body: [
              "Use **single inheritance** when one class is a straightforward specialization of another.",
              "Use **multiple inheritance** when a class genuinely combines independent behaviors and the relationship remains easy to understand.",
              "Use **multilevel inheritance** when each level represents a meaningful increase in specialization.",
              "Use **hierarchical inheritance** when several classes share the same parent but have different responsibilities.",
              "Use **hybrid inheritance** carefully because complex class relationships can make method lookup and maintenance more difficult.",
              "Inheritance should represent a meaningful **is-a** relationship (e.g. A Developer is an Employee). If the relationship is instead a **has-a** relationship, composition may be a better choice (e.g. A Car has an Engine)."
            ]
          },
          {
            kind: "callout",
            tone: "warn",
            title: "Common mistakes",
            body: "- **Repeating parent code in every child**: Put truly shared attributes and behavior in the parent class instead.\n- **Forgetting `super().__init__()`**: If the child defines its own initializer and still needs parent initialization, call the parent initializer with `super()`.\n- **Using inheritance only to avoid typing code**: Inheritance works best when there is a meaningful relationship between the classes.\n- **Assuming the child changes the parent**: Adding or overriding behavior in a child class does not modify the parent class.\n- **Using multiple inheritance without understanding MRO**: If parent classes contain overlapping methods, learn how Python chooses which method to call.\n- **Creating deep inheritance trees**: Too many levels can make code difficult to follow. Prefer simple, meaningful hierarchies.\n- **Using inheritance for a has-a relationship**: Use composition when one object contains or uses another object instead of being a specialized version of it."
          },
          {
            kind: "takeaways",
            items: [
              "Inheritance lets a child class reuse attributes and methods from a parent class.",
              "Single inheritance uses one parent and one child.",
              "Multiple inheritance allows one child to inherit from multiple parents.",
              "Multilevel inheritance creates a chain of parent and child classes.",
              "Hierarchical inheritance gives several child classes the same parent.",
              "Hybrid inheritance combines multiple inheritance patterns.",
              "A child class can add its own behavior without copying the parent's code.",
              "`super()` lets a child use functionality from its parent.",
              "Method overriding lets a child replace inherited behavior.",
              "Use inheritance when the classes have a meaningful relationship."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "inheritance-1",
                question: "What is single inheritance?",
                options: [
                  "When a child inherits from multiple parent classes.",
                  "When multiple children inherit from a single parent class.",
                  "When one child inherits from one parent class.",
                  "When a parent inherits from a child class."
                ],
                correctIndex: 2,
                explanation: "Single inheritance is a straightforward 1-to-1 relationship from parent to child."
              },
              {
                id: "inheritance-2",
                question: "How does multiple inheritance differ from multilevel inheritance?",
                options: [
                  "Multiple inheritance uses one parent, multilevel uses multiple parents.",
                  "Multiple inheritance combines multiple parents into one child. Multilevel inheritance chains classes together (Grandparent -> Parent -> Child).",
                  "They are the exact same thing.",
                  "Multilevel inheritance is faster than multiple inheritance."
                ],
                correctIndex: 1,
                explanation: "Multiple inheritance is parallel (combining traits), while multilevel is vertical (deepening traits)."
              },
              {
                id: "inheritance-3",
                question: "Why might a child class use `super().__init__()`?",
                options: [
                  "To skip calling the parent's initializer.",
                  "To call the parent's initializer so that the parent can set up the base attributes, before the child sets up its own.",
                  "To automatically create a new object of the parent class.",
                  "To delete the parent object."
                ],
                correctIndex: 1,
                explanation: "`super()` delegates method calls back to the parent class. Using it in `__init__` ensures the parent's setup logic runs."
              },
              {
                id: "inheritance-4",
                question: "Create a `Vehicle` class with a `move()` method that prints \"Vehicle is moving.\". Then create a `Bike` class that inherits from `Vehicle` and adds a `ring_bell()` method that prints \"Ring ring!\".",
                interactiveCode: true,
                initialCode: "# 1. Create the Vehicle class\n\n\n\n# 2. Create the Bike class (inherit from Vehicle)\n\n\n",
                testCode: "bike = Bike()\nbike.move()\nbike.ring_bell()",
                expectedOutput: "Vehicle is moving.\nRing ring!",
                explanation: "`Bike` can use the `move()` method it inherits from `Vehicle`, and it also has its own `ring_bell()` method."
              },
              {
                id: "inheritance-5",
                question: "Create a `Flyer` class with a `fly()` method that prints \"Flying.\". Create a `Swimmer` class with a `swim()` method that prints \"Swimming.\". Then create a `Duck` class that inherits from both.",
                interactiveCode: true,
                initialCode: "# 1. Create Flyer and Swimmer classes\n\n\n\n\n# 2. Create Duck class (multiple inheritance)\n\n\n",
                testCode: "duck = Duck()\nduck.fly()\nduck.swim()",
                expectedOutput: "Flying.\nSwimming.",
                explanation: "This is an example of Multiple Inheritance where `Duck(Flyer, Swimmer)` gets capabilities from both."
              }
            ]
          }
        ]
      },

      {
        slug: "polymorphism",
        title: "Polymorphism",
        subtitle: "Many Forms, One Interface",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "Programs often perform the same kind of action on different types of data.",
              "Python allows the same operator, function, or method name to behave differently depending on what receives it. This idea is called **polymorphism**, and it helps you write flexible code without creating separate logic for every object type."
            ]
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "Polymorphism means \"many forms.\"",
              "In Python, one operation can take different forms depending on the values or objects involved.",
              "For example, the `+` operator can add numbers:",
              "`print(10 + 20)` \u2192 `30`",
              "But the same operator can join strings:",
              "`print(\"Stack\" + \"Blueprint\")` \u2192 `StackBlueprint`",
              "The symbol is the same (`+`), but its behavior changes based on the data type."
            ]
          },
          {
            kind: "animation",
            variant: "polymorphism",
            caption: "Forms of Polymorphism"
          },
          {
            kind: "prose",
            heading: "Step-by-step",
            body: [
              "### 1. See polymorphism in the addition operator",
              "Python operators can behave differently for different data types. Consider addition:"
            ]
          },
          {
            kind: "interactive-code",
            code: "print(5 + 3)\nprint(2.5 + 1.5)\nprint(\"Stack\" + \"Blueprint\")\nprint([1, 2] + [3, 4])"
          },
          {
            kind: "prose",
            body: [
              "The same `+` operator performs numeric addition, string concatenation, and list concatenation. Python determines the correct behavior from the objects involved. This is **operator polymorphism**.",
              "### 2. Understand operator overloading",
              "Python also lets your own classes define how operators should behave. This is called **operator overloading**.",
              "You can define special methods with double underscores (like `__add__()` for the `+` operator) to control how objects behave.",
              "These are commonly called **dunder methods**. Because this is such an important aspect of polymorphism, you can dive deeper into `__add__()`, `__str__()`, `__len__()`, and more in the dedicated [Special Methods](/python/oop/special-methods) lesson!",
              "### 3. See function polymorphism",
              "A function can also work with different types of objects. The built-in `len()` function is a simple example."
            ]
          },
          {
            kind: "interactive-code",
            code: "print(len(\"Python\"))\nprint(len([10, 20, 30]))\nprint(len({\"name\": \"Maya\", \"role\": \"Developer\"}))"
          },
          {
            kind: "prose",
            body: [
              "The same `len()` function works with several different data types. What it counts depends on the object: characters, list items, or dictionary keys. This is an example of **function polymorphism**.",
              "### 4. Use class polymorphism",
              "Different classes can define methods with the same name."
            ]
          },
          {
            kind: "interactive-code",
            code: "class EmailNotification:\n    def send(self):\n        print(\"Sending an email.\")\n\nclass SMSNotification:\n    def send(self):\n        print(\"Sending an SMS.\")\n\nclass PushNotification:\n    def send(self):\n        print(\"Sending a push notification.\")\n\nnotifications = [\n    EmailNotification(),\n    SMSNotification(),\n    PushNotification()\n]\n\nfor notification in notifications:\n    notification.send()"
          },
          {
            kind: "prose",
            body: [
              "The exact same line `notification.send()` produces different behavior depending on the object. This is **class polymorphism**.",
              "### 5. Use polymorphism with inheritance",
              "Polymorphism commonly works together with inheritance. A parent class can define a method, and child classes can override that method."
            ]
          },
          {
            kind: "interactive-code",
            code: "class Employee:\n    def work(self):\n        print(\"Employee is working.\")\n\nclass Developer(Employee):\n    def work(self):\n        print(\"Developer is writing code.\")\n\nclass Designer(Employee):\n    def work(self):\n        print(\"Designer is creating a design.\")\n\nclass DataAnalyst(Employee):\n    def work(self):\n        print(\"Data analyst is studying data.\")\n\nemployees = [Developer(), Designer(), DataAnalyst()]\nfor employee in employees:\n    employee.work()"
          },
          {
            kind: "prose",
            body: [
              "Every object supports the same operation (`work()`) but each subclass provides its own implementation. This combines Inheritance (sharing a common parent) and Polymorphism (each child responds differently to the same method).",
              "### 6. Understand duck typing",
              "Python does not always require objects to share a parent class. If an object provides the behavior your code needs, Python can often use it. This idea is known as **duck typing**."
            ]
          },
          {
            kind: "interactive-code",
            code: "class FileLogger:\n    def write(self, message):\n        print(f\"File: {message}\")\n\nclass DatabaseLogger:\n    def write(self, message):\n        print(f\"Database: {message}\")\n\ndef save_log(logger, message):\n    logger.write(message)\n\nsave_log(FileLogger(), \"User logged in\")\nsave_log(DatabaseLogger(), \"User logged in\")"
          },
          {
            kind: "prose",
            body: [
              "These classes do not need a shared parent. `save_log()` cares about what the object can do (`write`), not what class it belongs to.",
              "### A simple example",
              "Imagine building the checkout system for an online store. Customers can pay with a credit card, PayPal, or a gift card. Each payment method performs the same general action (`pay(amount)`) but the actual process is different."
            ]
          },
          {
            kind: "interactive-code",
            code: "class Payment:\n    def pay(self, amount):\n        print(f\"Processing ${amount}\")\n\nclass CreditCardPayment(Payment):\n    def pay(self, amount):\n        print(f\"Charging ${amount} to the credit card.\")\n\nclass PayPalPayment(Payment):\n    def pay(self, amount):\n        print(f\"Sending ${amount} through PayPal.\")\n\nclass GiftCardPayment(Payment):\n    def pay(self, amount):\n        print(f\"Using ${amount} from the gift card balance.\")\n\ndef checkout(payment_method, amount):\n    payment_method.pay(amount)\n\ncheckout(CreditCardPayment(), 120)\ncheckout(PayPalPayment(), 80)\ncheckout(GiftCardPayment(), 25)"
          },
          {
            kind: "prose",
            body: [
              "The `checkout()` function does not contain long `if/elif` chains checking the payment type. Instead, each payment object knows how to perform its own `pay()` operation. This makes adding another payment method incredibly easy:"
            ]
          },
          {
            kind: "callout",
            tone: "warn",
            title: "Common mistakes",
            body: "- **Thinking polymorphism only means method overriding**: Python also shows polymorphism through operators, functions, and duck typing.\n- **Confusing operator overloading with normal addition**: Operator overloading means defining how an operator such as `+` behaves for your own class.\n- **Thinking polymorphism requires inheritance**: Python can use polymorphic behavior between unrelated classes if they provide the expected methods.\n- **Using long type-checking chains unnecessarily**: If several objects provide the same method, let the objects handle their own behavior instead of checking their type first."
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "poly-1",
                question: "Why can `+` work with both integers and strings?",
                options: [
                  "Because integers and strings inherit from the same parent.",
                  "Because Python automatically converts everything to strings.",
                  "Because of operator polymorphism, where `+` behaves differently based on the data type.",
                  "Because strings contain numbers in Python."
                ],
                correctIndex: 2,
                explanation: "The `+` operator has polymorphic behavior, mapping to numeric addition for ints and string concatenation for strings."
              },
              {
                id: "poly-2",
                question: "What special method lets a class define how the `+` operator behaves?",
                options: [
                  "`__plus__()`",
                  "`__add__()`",
                  "`__sum__()`",
                  "`__combine__()`"
                ],
                correctIndex: 1,
                explanation: "Python calls the `__add__()` method when the `+` operator is used on an object."
              },
              {
                id: "poly-3",
                question: "Why is `len()` an example of function polymorphism?",
                options: [
                  "It can only be used on strings.",
                  "It can return different data types.",
                  "It can be overridden by subclasses.",
                  "It works with several different data types, counting their respective elements."
                ],
                correctIndex: 3,
                explanation: "`len()` can count characters in a string, items in a list, or keys in a dictionary."
              },
              {
                id: "poly-4",
                question: "Do two classes always need the same parent class to behave polymorphically?",
                options: [
                  "Yes, without inheritance, polymorphism is impossible.",
                  "No, thanks to duck typing, unrelated classes can behave polymorphically if they share the same method names."
                ],
                correctIndex: 1,
                explanation: "Duck typing allows Python to focus on whether an object has the right methods, regardless of its inheritance."
              },
              {
                id: "poly-tiny-task",
                question: "Create two classes, `PDFReport` and `CSVReport`. Both should provide an `export()` method. Then create a function `export_report(report)` that calls `export()` on any report passed to it.",
                interactiveCode: true,
                initialCode: "# Write your classes and function here:\n\n",
                testCode: "export_report(PDFReport())\nexport_report(CSVReport())",
                expectedOutput: "Exporting PDF report.\nExporting CSV report.",
                explanation: "Both classes implement `export()`, allowing `export_report` to treat them polymorphically."
              },
              {
                id: "poly-bonus-task",
                question: "Create a `Money` class that takes an `amount` in `__init__`. Define `__add__()` so two `Money` objects can be added, returning a new `Money` object with the total amount. Print the final amount.",
                interactiveCode: true,
                initialCode: "# Create your Money class here:\n\n",
                testCode: "m1 = Money(100)\nm2 = Money(50)\ntotal = m1 + m2\nprint(total.amount)",
                expectedOutput: "150",
                explanation: "By defining `__add__(self, other)`, you taught Python how to combine two Money objects using the `+` operator."
              }
            ]
          },
          {
            kind: "takeaways",
            items: [
              "Polymorphism allows one operation to take different forms.",
              "Operators such as `+` behave differently depending on their operands.",
              "Operator overloading lets your own classes define operator behavior using special methods such as `__add__()`.",
              "Functions such as `len()` can work with several types of objects.",
              "Different classes can provide the same method name with different implementations.",
              "Inheritance and method overriding are common ways to implement polymorphism.",
              "Python's duck typing allows code to focus on an object's behavior rather than only its exact class."
            ]
          }
        ]
      },
      {
        slug: "abstraction",
        title: "Abstraction",
        subtitle: "Learn how abstraction lets you define what a class must do while hiding the implementation details behind a simple interface.",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "In larger programs, you often care about what an object can do more than how it performs the task internally.",
              "Abstraction helps you define a clear contract for related classes. Each class can implement the details differently while the rest of your program uses the same simple interface."
            ]
          },
          {
            kind: "animation",
            variant: "abstraction",
            caption: "Abstraction and Interfaces"
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "Abstraction means exposing the essential behavior of an object while hiding unnecessary implementation details.",
              "You already use abstraction every day in Python.",
              "When you write: `file.read()` you do not need to know how Python communicates with the operating system, reads bytes from disk, or manages buffers.",
              "You only need to know:",
              "`read()` → gives me data",
              "The parent defines the expected behavior. Child classes provide the actual implementation."
            ]
          },
          {
            kind: "prose",
            heading: "1. Start with a shared interface",
            body: [
              "Suppose you are building a payment system.",
              "Every payment type should support the same operation: `pay(amount)`. You could start with a normal parent class and then create child classes:"
            ]
          },
          {
            kind: "interactive-code",
            code: "class Payment:\n    def pay(self, amount):\n        pass\n\n\nclass CreditCardPayment(Payment):\n    def pay(self, amount):\n        print(f\"Charging \${amount} to a credit card.\")\n\n\nclass PayPalPayment(Payment):\n    def pay(self, amount):\n        print(f\"Sending \${amount} through PayPal.\")\n\n\n# Using the shared interface\ncard = CreditCardPayment()\ncard.pay(100)\n\npaypal = PayPalPayment()\npaypal.pay(50)"
          },
          {
            kind: "prose",
            body: [
              "This creates a shared structure, but there is a problem.",
              "Python still allows this:"
            ]
          },
          {
            kind: "interactive-code",
            code: `class Payment:\n    def pay(self, amount):\n        pass  # Does nothing!\n\n\n# Problem: Python allows instantiating the base class directly\npayment = Payment()\nresult = payment.pay(100)\n\nprint(f"Payment result: {result}")  # Prints None without doing anything`
          },
          {
            kind: "prose",
            body: [
              "The base class does not actually know how to process a payment.",
              "That is where abstract classes help."
            ]
          },
          {
            kind: "prose",
            heading: "2. Create an abstract class with ABC",
            body: [
              "Python provides the `abc` module for abstraction.",
              "ABC stands for Abstract Base Class."
            ]
          },
          {
            kind: "interactive-code",
            code: "from abc import ABC\n\nclass Payment(ABC):\n    pass"
          },
          {
            kind: "prose",
            body: [
              "By inheriting from `ABC`, you can mark methods that child classes are expected to implement.",
              "At this point, `Payment` is an abstract base class in structure, but it still needs an abstract method."
            ]
          },
          {
            kind: "prose",
            heading: "3. Define an abstract method",
            body: [
              "Use the `@abstractmethod` decorator to define behavior that child classes must provide."
            ]
          },
          {
            kind: "interactive-code",
            code: "from abc import ABC, abstractmethod\n\nclass Payment(ABC):\n    @abstractmethod\n    def pay(self, amount):\n        pass"
          },
          {
            kind: "prose",
            body: [
              "`pay()` now acts as a required method.",
              "A child class must provide its own implementation before you can create objects from it.",
              "For example:"
            ]
          },
          {
            kind: "interactive-code",
            code: "from abc import ABC, abstractmethod\n\nclass Payment(ABC):\n    @abstractmethod\n    def pay(self, amount):\n        pass\n\nclass CreditCardPayment(Payment):\n    def pay(self, amount):\n        print(f\"Charging ${amount} to a credit card.\")\n\ncard = CreditCardPayment()\ncard.pay(100)"
          },
          {
            kind: "prose",
            body: [
              "But this does not:"
            ]
          },
          {
            kind: "interactive-code",
            code: "from abc import ABC, abstractmethod\n\nclass Payment(ABC):\n    @abstractmethod\n    def pay(self, amount):\n        pass\n\npayment = Payment()"
          },
          {
            kind: "prose",
            body: [
              "Python prevents direct instantiation because `Payment` still contains an abstract method."
            ]
          },
          {
            kind: "prose",
            heading: "4. Require every child class to follow the contract",
            body: [
              "Now create another payment type. Both child classes satisfy the same contract."
            ]
          },
          {
            kind: "interactive-code",
            code: "from abc import ABC, abstractmethod\n\nclass Payment(ABC):\n    @abstractmethod\n    def pay(self, amount):\n        pass\n\nclass CreditCardPayment(Payment):\n    def pay(self, amount):\n        print(f\"Charging ${amount} to a credit card.\")\n\nclass PayPalPayment(Payment):\n    def pay(self, amount):\n        print(f\"Sending ${amount} through PayPal.\")"
          },
          {
            kind: "prose",
            body: [
              "If a child forgets to implement `pay()`:"
            ]
          },
          {
            kind: "interactive-code",
            code: "from abc import ABC, abstractmethod\n\nclass Payment(ABC):\n    @abstractmethod\n    def pay(self, amount):\n        pass\n\nclass GiftCardPayment(Payment):\n    pass\n\n# This will fail!\ngift_card = GiftCardPayment()"
          },
          {
            kind: "prose",
            body: [
              "Python raises a `TypeError` because the required abstract method is missing.",
              "This is the main value of abstract methods. They make the expected behavior explicit."
            ]
          },
          {
            kind: "prose",
            heading: "5. Combine abstraction with polymorphism",
            body: [
              "Abstraction and polymorphism work naturally together.",
              "Once every payment class follows the same contract, you can write one checkout function:"
            ]
          },
          {
            kind: "interactive-code",
            code: "from abc import ABC, abstractmethod\n\nclass Payment(ABC):\n    @abstractmethod\n    def pay(self, amount):\n        pass\n\nclass CreditCardPayment(Payment):\n    def pay(self, amount):\n        print(f\"Charging ${amount} to a credit card.\")\n\nclass PayPalPayment(Payment):\n    def pay(self, amount):\n        print(f\"Sending ${amount} through PayPal.\")\n\ndef checkout(payment_method, amount):\n    payment_method.pay(amount)\n\ncheckout(CreditCardPayment(), 120)\ncheckout(PayPalPayment(), 80)"
          },
          {
            kind: "prose",
            body: [
              "The `checkout` function only cares that the object satisfies the payment interface.",
              "It does not care how the payment is processed internally.",
              "This is where abstraction and polymorphism connect:",
              "- **Abstraction**: defines the required behavior.",
              "- **Polymorphism**: allows each class to implement that behavior differently."
            ]
          },
          {
            kind: "prose",
            heading: "6. Add concrete methods to an abstract class",
            body: [
              "Abstract classes do not need to contain only abstract methods.",
              "They can also provide shared behavior."
            ]
          },
          {
            kind: "interactive-code",
            code: "from abc import ABC, abstractmethod\n\nclass Payment(ABC):\n    def validate_amount(self, amount):\n        return amount > 0\n\n    @abstractmethod\n    def pay(self, amount):\n        pass\n\nclass CreditCardPayment(Payment):\n    def pay(self, amount):\n        if not self.validate_amount(amount):\n            print(\"Invalid payment amount.\")\n            return\n        print(f\"Charging ${amount} to a credit card.\")\n\ncard = CreditCardPayment()\ncard.pay(100)\ncard.pay(-20)"
          },
          {
            kind: "prose",
            body: [
              "This lets the abstract base class define both required behavior and reusable shared logic."
            ]
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "Imagine you are building a report-export system for a business dashboard.",
              "Users can export reports as PDF, CSV, or Excel files.",
              "Every exporter should provide the same operation: `export(data)`",
              "But each format handles the export differently."
            ]
          },
          {
            kind: "interactive-code",
            code: "from abc import ABC, abstractmethod\n\nclass ReportExporter(ABC):\n    @abstractmethod\n    def export(self, data):\n        pass\n\nclass PDFExporter(ReportExporter):\n    def export(self, data):\n        print(f\"Exporting '{data}' as PDF.\")\n\nclass CSVExporter(ReportExporter):\n    def export(self, data):\n        print(f\"Exporting '{data}' as CSV.\")\n\nclass ExcelExporter(ReportExporter):\n    def export(self, data):\n        print(f\"Exporting '{data}' as Excel.\")\n\ndef export_report(exporter, data):\n    exporter.export(data)\n\nexport_report(PDFExporter(), \"Sales Report\")\nexport_report(CSVExporter(), \"Sales Report\")\nexport_report(ExcelExporter(), \"Sales Report\")"
          },
          {
            kind: "prose",
            body: [
              "The rest of the dashboard only needs to know one thing: Every exporter provides `export(data)`.",
              "It does not need to know how PDF generation differs from CSV or Excel generation. That implementation detail stays inside each exporter class.",
              "Later, you could add:"
            ]
          },
          {
            kind: "interactive-code",
            code: "class JSONExporter(ReportExporter):\n    def export(self, data):\n        print(f\"Exporting '{data}' as JSON.\")"
          },
          {
            kind: "prose",
            body: [
              "The existing `export_report()` function does not need to change."
            ]
          },
          {
            kind: "callout",
            tone: "warn",
            title: "Common mistakes",
            body: "- **Thinking abstraction means hiding all code**: Abstraction hides unnecessary implementation details from the caller. The implementation still exists inside the class.\n- **Confusing abstraction with encapsulation**: Encapsulation controls access to data. Abstraction focuses on exposing essential behavior while hiding implementation details.\n- **Creating an abstract method without implementing it in the child**: A concrete child class must implement all required abstract methods before it can be instantiated.\n- **Using abstract classes when there is only one implementation**: Abstraction is most useful when multiple related classes share a common contract.\n- **Putting every method behind @abstractmethod**: Abstract classes can also contain normal methods for shared behavior.\n- **Trying to create an object directly from an abstract class**: If the class still has abstract methods, Python prevents instantiation."
          },
          {
            kind: "takeaways",
            items: [
              "Abstraction exposes essential behavior while hiding implementation details.",
              "Python provides abstract base classes through the `abc` module.",
              "`ABC` is used to define an abstract base class.",
              "`@abstractmethod` marks behavior that child classes must implement.",
              "Abstract classes can also provide shared concrete methods.",
              "Abstraction defines a contract, while polymorphism lets different classes fulfill that contract differently.",
              "Abstract classes are useful when several related classes must follow the same structure."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "q1",
                question: "What is abstraction in OOP?",
                options: [
                  "Exposing essential behavior while hiding implementation details.",
                  "Controlling access to data through private variables.",
                  "Allowing classes to inherit from multiple parents.",
                  "Packing data and methods into a single unit."
                ],
                correctIndex: 0,
                explanation: "Abstraction simplifies interaction by exposing a simple interface and hiding the complex implementation details."
              },
              {
                id: "q2",
                question: "What does ABC stand for?",
                options: [
                  "Automated Base Class",
                  "Abstract Base Class",
                  "Abstract Basic Contract",
                  "Application Base Code"
                ],
                correctIndex: 1,
                explanation: "ABC stands for Abstract Base Class, which is provided by the `abc` module."
              },
              {
                id: "q3",
                question: "What does `@abstractmethod` do?",
                options: [
                  "It automatically implements the method for all children.",
                  "It marks behavior that child classes must implement.",
                  "It prevents any class from having methods with that name.",
                  "It makes the method run faster."
                ],
                correctIndex: 1,
                explanation: "It enforces a contract by requiring child classes to provide their own implementation for the method."
              },
              {
                id: "q4",
                question: "Can an abstract class contain normal methods?",
                options: [
                  "Yes, it can provide shared concrete methods.",
                  "No, it can only contain abstract methods.",
                  "Only if the child class overrides them.",
                  "Yes, but they must not take any arguments."
                ],
                correctIndex: 0,
                explanation: "Abstract classes can mix both abstract methods (required) and concrete methods (shared behavior)."
              },
              {
                id: "q5",
                interactiveCode: true,
                question: "Create an abstract `Notification` class with a required `send(message)` method. Then create `EmailNotification` and `SMSNotification` classes that implement `send()`.",
                initialCode: "from abc import ABC, abstractmethod\n\n# Define Notification, EmailNotification, and SMSNotification here:\n",
                testCode: "import sys\n\ntry:\n    # 1. Check if Notification is ABC\n    if not issubclass(Notification, ABC):\n        print(\"Notification is not an Abstract Base Class (does not inherit from ABC)\")\n        sys.exit(1)\n    \n    # 2. Check if send is abstract\n    if not 'send' in Notification.__abstractmethods__:\n        print(\"Notification must have an abstract 'send' method\")\n        sys.exit(1)\n    \n    # 3. Check implementations\n    email = EmailNotification()\n    sms = SMSNotification()\n    \n    if not hasattr(email, 'send') or not hasattr(sms, 'send'):\n        print(\"Child classes must implement send()\")\n        sys.exit(1)\n        \n    print(\"Success! You implemented the abstract base class and concrete classes correctly.\")\nexcept NameError as e:\n    print(f\"Missing definition: {e}\")\n    sys.exit(1)\nexcept TypeError as e:\n    if \"Can't instantiate abstract class\" in str(e):\n        print(f\"Error: You tried to instantiate an abstract class. Make sure all abstract methods are implemented.\\nDetails: {e}\")\n    else:\n        print(f\"Error: {e}\")\n    sys.exit(1)\nexcept Exception as e:\n    print(f\"Error: {e}\")\n    sys.exit(1)",
                expectedOutput: "Success! You implemented the abstract base class and concrete classes correctly."
              }
            ]
          }
        ]
      },
      {
        slug: "composition",
        title: "Composition",
        subtitle: "Learn how to build larger Python objects by combining smaller objects instead of forcing everything into an inheritance hierarchy.",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "Real applications are made of objects that work together.",
              "An order has products. A computer has a processor. A car has an engine. Composition lets you model these relationships by placing one object inside another object.",
              "This gives each class a focused responsibility and lets you reuse components without creating complicated inheritance trees."
            ]
          },
          {
            kind: "animation",
            variant: "composition",
            caption: "Object Composition"
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "Composition means building one object using objects from other classes.",
              "It usually represents a **has-a** relationship.",
              "For example:",
              "Car has an Engine. Computer has a Processor. Order has a ShoppingCart.",
              "Consider:"
            ]
          },
          {
            kind: "interactive-code",
            code: "class Engine:\n    def start(self):\n        print(\"Engine started.\")\n\nclass Car:\n    def __init__(self):\n        self.engine = Engine()"
          },
          {
            kind: "prose",
            body: [
              "`Car` does not inherit from `Engine`.",
              "Instead, a `Car` object contains an `Engine` object.",
              "This is composition."
            ]
          },
          {
            kind: "prose",
            heading: "1. Create the component class",
            body: [
              "Start with a class that handles one responsibility."
            ]
          },
          {
            kind: "interactive-code",
            code: "class Engine:\n    def start(self):\n        print(\"Engine started.\")\n\n    def stop(self):\n        print(\"Engine stopped.\")"
          },
          {
            kind: "prose",
            body: [
              "`Engine` knows how to manage engine-related behavior.",
              "It does not need to know anything about the entire car."
            ]
          },
          {
            kind: "prose",
            heading: "2. Place one object inside another",
            body: [
              "Now create the `Car` class."
            ]
          },
          {
            kind: "interactive-code",
            code: "class Engine:\n    def start(self):\n        print(\"Engine started.\")\n\nclass Car:\n    def __init__(self, brand):\n        self.brand = brand\n        self.engine = Engine()\n\ncar = Car(\"Toyota\")\ncar.engine.start()"
          },
          {
            kind: "prose",
            body: [
              "The important line is `self.engine = Engine()`.",
              "Python creates an `Engine` object and stores it inside the `Car` object.",
              "The `Car` is the larger object. `Engine` is one of its components."
            ]
          },
          {
            kind: "prose",
            heading: "3. Delegate work to the component",
            body: [
              "You may not want users of `Car` to interact with the engine directly.",
              "The `Car` class can expose its own method:"
            ]
          },
          {
            kind: "interactive-code",
            code: "class Engine:\n    def start(self):\n        print(\"Engine started.\")\n\nclass Car:\n    def __init__(self, brand):\n        self.brand = brand\n        self.engine = Engine()\n\n    def start(self):\n        self.engine.start()\n\ncar = Car(\"Toyota\")\ncar.start()"
          },
          {
            kind: "prose",
            body: [
              "`Car.start()` passes the actual work to `Engine.start()`.",
              "This is called **delegation**.",
              "The outer object decides what operation should be available. The component handles the specialized work."
            ]
          },
          {
            kind: "prose",
            heading: "4. Pass a component into another object",
            body: [
              "A class does not always need to create its component itself.",
              "You can create the component first and pass it in:"
            ]
          },
          {
            kind: "interactive-code",
            code: "class Engine:\n    def start(self):\n        print(\"Gas engine started.\")\n\nclass Car:\n    def __init__(self, brand, engine):\n        self.brand = brand\n        self.engine = engine\n\n    def start(self):\n        self.engine.start()\n\nengine = Engine()\ncar = Car(\"Toyota\", engine)\ncar.start()"
          },
          {
            kind: "prose",
            body: [
              "This approach makes the design more flexible because `Car` is not responsible for creating a particular engine.",
              "You could provide another compatible engine:"
            ]
          },
          {
            kind: "interactive-code",
            code: "class ElectricMotor:\n    def start(self):\n        print(\"Electric motor started.\")\n\nclass Car:\n    def __init__(self, brand, engine):\n        self.brand = brand\n        self.engine = engine\n\n    def start(self):\n        self.engine.start()\n\nmotor = ElectricMotor()\ncar = Car(\"Tesla\", motor)\ncar.start()"
          },
          {
            kind: "prose",
            body: [
              "The `Car` behavior changes based on the component it receives."
            ]
          },
          {
            kind: "prose",
            heading: "5. Compare composition and inheritance",
            body: [
              "Inheritance and composition both connect classes, but they describe different relationships.",
              "Inheritance usually represents **is-a**.",
              "Example: `Developer` is an `Employee`. `Dog` is an `Animal`.",
              "Composition usually represents **has-a**.",
              "Example: `Car` has an `Engine`. `Order` has a `ShoppingCart`."
            ]
          },
          {
            kind: "interactive-code",
            code: "class Employee:\n    pass\n\nclass Developer(Employee):\n    pass\n\nclass Engine:\n    pass\n\nclass Car:\n    def __init__(self):\n        self.engine = Engine()"
          },
          {
            kind: "prose",
            body: [
              "A useful decision rule is:",
              "**Is A?** → Consider inheritance",
              "**Has A?** → Consider composition"
            ]
          },
          {
            kind: "prose",
            heading: "6. Understand composition vs aggregation",
            body: [
              "You may also encounter the term **aggregation**.",
              "Both composition and aggregation describe objects containing or using other objects. The difference is mainly about ownership and lifetime.",
              "Consider **composition**:"
            ]
          },
          {
            kind: "interactive-code",
            code: "class Processor:\n    pass\n\nclass Computer:\n    def __init__(self):\n        self.processor = Processor()"
          },
          {
            kind: "prose",
            body: [
              "The `Computer` creates its own `Processor`. It strongly owns the processor.",
              "With **aggregation**, the other object commonly exists independently and is supplied from outside:"
            ]
          },
          {
            kind: "interactive-code",
            code: "class Employee:\n    def __init__(self, name):\n        self.name = name\n\nclass Team:\n    def __init__(self, manager):\n        self.manager = manager\n\nmanager = Employee(\"Maya\")\nteam = Team(manager)"
          },
          {
            kind: "prose",
            body: [
              "The `manager` could exist before the team and can continue to exist after the team is disbanded.",
              "A useful mental model is:",
              "- **Inheritance**: `is-a` (Developer is an Employee)",
              "- **Composition**: `strongly has-a` (Computer has a Processor)",
              "- **Aggregation**: `uses or contains an independent object` (Team has a Manager)",
              "Python itself does not enforce these design meanings. They describe how you intend objects to relate to each other."
            ]
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "Imagine you are building the order system for an online store.",
              "An order contains a shopping cart. The shopping cart is responsible for storing products and calculating the total.",
              "Instead of putting all cart logic inside `Order`, create a separate class."
            ]
          },
          {
            kind: "interactive-code",
            code: "class ShoppingCart:\n    def __init__(self):\n        self.items = []\n\n    def add_item(self, name, price):\n        self.items.append((name, price))\n\n    def calculate_total(self):\n        return sum(price for name, price in self.items)"
          },
          {
            kind: "prose",
            body: [
              "Now compose an `Order` using a `ShoppingCart`."
            ]
          },
          {
            kind: "interactive-code",
            code: "class ShoppingCart:\n    def __init__(self):\n        self.items = []\n\n    def add_item(self, name, price):\n        self.items.append((name, price))\n\n    def calculate_total(self):\n        return sum(price for name, price in self.items)\n\nclass Order:\n    def __init__(self, order_id):\n        self.order_id = order_id\n        self.cart = ShoppingCart()\n\n    def add_product(self, name, price):\n        self.cart.add_item(name, price)\n\n    def checkout(self):\n        total = self.cart.calculate_total()\n        print(f\"Order {self.order_id}: ${total}\")\n\norder = Order(\"ORD-101\")\norder.add_product(\"Keyboard\", 80)\norder.add_product(\"Mouse\", 40)\norder.checkout()"
          },
          {
            kind: "prose",
            body: [
              "`Order` handles the ordering workflow.",
              "`ShoppingCart` handles products and totals.",
              "The order does not need to know how the shopping cart calculates its total. It delegates that responsibility.",
              "Later, the shopping cart could change how discounts or taxes are calculated without forcing the entire `Order` class to manage those details. That separation is one of the main reasons composition becomes valuable as applications grow."
            ]
          },
          {
            kind: "callout",
            tone: "warn",
            title: "Common mistakes",
            body: "- **Using inheritance for every relationship**: Ask whether one object really is another. If it instead has another object, composition may fit better.\n- **Putting every responsibility in one class**: Break independent responsibilities into smaller classes and combine them when needed.\n- **Accessing deeply nested components everywhere**: Consider delegation methods such as `car.start()` instead of exposing `car.engine.start()` throughout the program.\n- **Confusing composition with inheritance**: Composition stores or uses another object. It does not inherit its methods automatically.\n- **Assuming composition and aggregation are enforced by Python**: Their distinction describes design intent and object ownership, not a special Python keyword.\n- **Creating unnecessary tiny classes**: Use composition when a component represents a meaningful responsibility or reusable behavior."
          },
          {
            kind: "takeaways",
            items: [
              "Composition builds larger objects from smaller objects.",
              "Composition usually represents a has-a relationship.",
              "One object can store another object as an instance attribute.",
              "Delegation lets an object pass work to one of its components.",
              "Inheritance models is-a, while composition models has-a.",
              "Aggregation describes a looser relationship where the contained object can exist independently.",
              "Passing components into an object can make its behavior easier to replace or extend.",
              "Prefer clear relationships over deep or unnecessary inheritance hierarchies."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "c1",
                question: "What kind of relationship does composition usually represent?",
                options: [
                  "An is-a relationship",
                  "A has-a relationship",
                  "A parent-child relationship",
                  "A recursive relationship"
                ],
                correctIndex: 1,
                explanation: "Composition typically models a \"has-a\" relationship, like a Car has an Engine."
              },
              {
                id: "c2",
                question: "Why should `Car` contain an `Engine` instead of inherit from it?",
                options: [
                  "Because Python doesn't support multiple inheritance.",
                  "Because an Engine cannot have methods.",
                  "Because a Car is not an Engine, it has an Engine.",
                  "Because inheritance is slower."
                ],
                correctIndex: 2,
                explanation: "Inheritance represents \"is-a\". Since a Car is not an Engine, composition is the correct modeling choice."
              },
              {
                id: "c3",
                question: "What does delegation mean in composition?",
                options: [
                  "Passing an entire object as an argument to a function.",
                  "Deleting an object when it's no longer needed.",
                  "Creating an object inside a child class.",
                  "An outer object passing work to its internal component to handle."
                ],
                correctIndex: 3,
                explanation: "Delegation is when a method on the main object calls a method on its component to perform the actual work (e.g. car.start() calling self.engine.start())."
              },
              {
                id: "c4",
                question: "How does aggregation conceptually differ from composition?",
                options: [
                  "Aggregation represents \"is-a\", composition represents \"has-a\".",
                  "Aggregation means the contained object exists independently and is supplied from outside.",
                  "Aggregation only works with built-in data types.",
                  "There is no difference in Python."
                ],
                correctIndex: 1,
                explanation: "While both model \"has-a\", aggregation implies a looser relationship where the component object has its own independent lifecycle."
              },
              {
                id: "c5",
                interactiveCode: true,
                question: "Create a `Battery` class with a `charge()` method. Then create a `Laptop` class that is passed a battery object in its `__init__`, and has a `charge()` method that delegates to the battery.",
                initialCode: "class Battery:\n    pass\n\nclass Laptop:\n    pass\n\n# Usage:\n# battery = Battery()\n# laptop = Laptop(battery)\n# laptop.charge()",
                testCode: "import sys\n\ntry:\n    # 1. Check Battery\n    b = Battery()\n    if not hasattr(b, 'charge'):\n        print(\"Battery is missing the 'charge' method.\")\n        sys.exit(1)\n    \n    # 2. Check Laptop takes battery in init\n    l = Laptop(b)\n    \n    if not hasattr(l, 'charge'):\n        print(\"Laptop is missing the 'charge' method.\")\n        sys.exit(1)\n    \n    # Check delegation (it should just run without crashing, or we can check stdout)\n    l.charge()\n        \n    print(\"Success! You correctly used composition and delegation.\")\nexcept TypeError as e:\n    if \"__init__() takes 1 positional argument but 2 were given\" in str(e):\n        print(\"Laptop.__init__ should accept a battery argument: __init__(self, battery)\")\n    else:\n        print(f\"Error: {e}\")\n    sys.exit(1)\nexcept NameError as e:\n    print(f\"Missing definition: {e}\")\n    sys.exit(1)\nexcept Exception as e:\n    print(f\"Error: {e}\")\n    sys.exit(1)",
                expectedOutput: "Success! You correctly used composition and delegation."
              }
            ]
          }
        ]
      },
      {
        slug: "special-methods",
        title: "Special Methods",
        subtitle: "Dunder Methods",
        sections: [
          {
            kind: "prose",
            heading: "Why this matters",
            body: [
              "Built-in Python objects feel natural to use:",
              "\`len(items)\`   \`price1 + price2\`   \`user1 == user2\`   \`print(product)\`",
              "Your own classes can support the same style of code. Python does this through special methods, commonly called **dunder methods** because their names begin and end with double underscores.",
              "Python's data model uses these methods to connect language syntax and built-in operations to your classes."
            ]
          },
          {
            kind: "animation",
            variant: "special-methods",
            caption: "The Dunder Translation Engine"
          },
          {
            kind: "prose",
            heading: "The core idea",
            body: [
              "A dunder method is a method with a name such as:",
              "\`__init__()\`   \`__str__()\`   \`__repr__()\`   \`__len__()\`   \`__add__()\`   \`__eq__()\`",
              "You usually do not call these methods directly. Instead, Python calls them when you use normal Python syntax.",
              "- \`Product(...)\` → \`__init__()\`",
              "- \`print(product)\` → \`__str__()\`",
              "- \`repr(product)\` → \`__repr__()\`",
              "- \`len(cart)\` → \`__len__()\`",
              "- \`a + b\` → \`__add__()\`",
              "- \`a == b\` → \`__eq__()\`",
              "For example, defining \`__add__()\` lets a class decide how the \`+\` operator should behave for its objects."
            ]
          },
          {
            kind: "prose",
            heading: "1. Initialize objects with __init__()",
            body: [
              "You have already used the most familiar special method:"
            ]
          },
          {
            kind: "interactive-code",
            code: "class Product:\n    def __init__(self, name, price):\n        self.name = name\n        self.price = price\n\nproduct = Product(\"Laptop\", 900)\nprint(product)  # Output: <__main__.Product object at 0x...>"
          },
          {
            kind: "prose",
            body: [
              "When you write \`product = Product(\"Laptop\", 900)\`, Python creates the object and then uses \`__init__()\` to initialize its state.",
              "You should think of \`__init__()\` as the setup step for a newly created object."
            ]
          },
          {
            kind: "prose",
            heading: "2. Make objects readable with __str__()",
            body: [
              "Without a custom string representation, printing an object is not very useful. Define \`__str__()\`:"
            ]
          },
          {
            kind: "interactive-code",
            code: "class Product:\n    def __init__(self, name, price):\n        self.name = name\n        self.price = price\n\n    def __str__(self):\n        return f\"{self.name} - ${self.price}\"\n\nproduct = Product(\"Laptop\", 900)\nprint(product)  # Output: Laptop - $900"
          },
          {
            kind: "prose",
            body: [
              "\`__str__()\` should return a string. Python uses it for the object's readable or informal representation, including common situations such as \`str(object)\` and \`print(object)\`."
            ]
          },
          {
            kind: "prose",
            heading: "3. Add a developer representation with __repr__()",
            body: [
              "\`__repr__()\` also returns a string representation, but it is usually aimed at developers."
            ]
          },
          {
            kind: "interactive-code",
            code: "class Product:\n    def __init__(self, name, price):\n        self.name = name\n        self.price = price\n\n    def __str__(self):\n        return f\"{self.name} - ${self.price}\"\n\n    def __repr__(self):\n        return f\"Product(name={self.name!r}, price={self.price!r})\"\n\nproduct = Product(\"Laptop\", 900)\nprint(str(product))\nprint(repr(product))"
          },
          {
            kind: "prose",
            body: [
              "A useful mental model is:",
              "- \`__str__()\` ↓ Readable for users",
              "- \`__repr__()\` ↓ Useful for developers and debugging",
              "If a class provides \`__repr__()\` but no \`__str__()\`, Python can use the representation from \`__repr__()\` where a printable string is needed."
            ]
          },
          {
            kind: "prose",
            heading: "4. Support len() with __len__()",
            body: [
              "Suppose a shopping cart stores several products. Python's \`len()\` operation uses \`__len__()\`, which must return a non-negative integer."
            ]
          },
          {
            kind: "interactive-code",
            code: "class ShoppingCart:\n    def __init__(self):\n        self.items = []\n\n    def add(self, product):\n        self.items.append(product)\n\n    def __len__(self):\n        return len(self.items)\n\ncart = ShoppingCart()\ncart.add(\"Laptop\")\ncart.add(\"Mouse\")\n\nprint(len(cart))  # Output: 2"
          },
          {
            kind: "prose",
            heading: "5. Overload operators with __add__()",
            body: [
              "Suppose you want two shopping carts to be combined using \`+\`.",
              "Your class defines what \`+\` means for its objects by implementing \`__add__()\`."
            ]
          },
          {
            kind: "interactive-code",
            code: "class ShoppingCart:\n    def __init__(self, items):\n        self.items = items\n\n    def __add__(self, other):\n        return ShoppingCart(self.items + other.items)\n\ncart1 = ShoppingCart([\"Laptop\", \"Mouse\"])\ncart2 = ShoppingCart([\"Keyboard\"])\n\ncombined = cart1 + cart2\nprint(combined.items)"
          },
          {
            kind: "prose",
            body: [
              "Conceptually, \`cart1 + cart2\` becomes \`cart1.__add__(cart2)\`.",
              "This is operator overloading. You normally implement an operator only when the operation has a clear meaning for the class.",
              "Common arithmetic mappings include:",
              "- \`+\` → \`__add__()\`",
              "- \`-\` → \`__sub__()\`",
              "- \`*\` → \`__mul__()\`",
              "- \`/\` → \`__truediv__()\`"
            ]
          },
          {
            kind: "prose",
            heading: "6. Compare objects with __eq__()",
            body: [
              "By default, two separate custom objects are not automatically considered equal simply because their attributes contain the same values.",
              "You can define what equality means with \`__eq__()\`."
            ]
          },
          {
            kind: "interactive-code",
            code: "class Product:\n    def __init__(self, sku, name):\n        self.sku = sku\n        self.name = name\n\n    def __eq__(self, other):\n        return self.sku == other.sku\n\nproduct1 = Product(\"SKU100\", \"Laptop\")\nproduct2 = Product(\"SKU100\", \"Laptop Pro\")\n\n# Same SKU -> Same product\nprint(product1 == product2)  # Output: True"
          },
          {
            kind: "prose",
            heading: "7. Make objects callable with __call__()",
            body: [
              "A class can even make its objects behave like functions using \`__call__()\`."
            ]
          },
          {
            kind: "interactive-code",
            code: "class Discount:\n    def __init__(self, percent):\n        self.percent = percent\n\n    def __call__(self, price):\n        return price * (1 - self.percent / 100)\n\n# Create an object\nsummer_sale = Discount(20)\n\n# Call the object\nprint(summer_sale(100))  # Output: 80.0"
          },
          {
            kind: "prose",
            body: [
              "Instead of writing \`summer_sale.apply(100)\`, the object itself can be called. Conceptually, \`summer_sale(100)\` becomes \`summer_sale.__call__(100)\`.",
              "This can be useful when an object represents an operation that also needs to remember configuration or state."
            ]
          },
          {
            kind: "prose",
            heading: "A simple example",
            body: [
              "Imagine you are building the shopping-cart system for an online store.",
              "You want your custom objects to work naturally with Python."
            ]
          },
          {
            kind: "interactive-code",
            code: "class Product:\n    def __init__(self, sku, name, price):\n        self.sku = sku\n        self.name = name\n        self.price = price\n\n    def __str__(self):\n        return f\"{self.name} - ${self.price}\"\n\n    def __repr__(self):\n        return (\n            f\"Product(sku={self.sku!r}, \"\n            f\"name={self.name!r}, price={self.price!r})\"\n        )\n\n    def __eq__(self, other):\n        if not isinstance(other, Product):\n            return NotImplemented\n        return self.sku == other.sku\n\nclass ShoppingCart:\n    def __init__(self):\n        self.items = []\n\n    def add(self, product):\n        self.items.append(product)\n\n    def __len__(self):\n        return len(self.items)\n\n    def total(self):\n        return sum(product.price for product in self.items)\n\nkeyboard = Product(\"SKU101\", \"Keyboard\", 80)\nmouse = Product(\"SKU102\", \"Mouse\", 40)\n\ncart = ShoppingCart()\ncart.add(keyboard)\ncart.add(mouse)\n\nprint(keyboard)\nprint(len(cart))\nprint(cart.total())"
          },
          {
            kind: "prose",
            body: [
              "The classes now work with familiar Python operations:",
              "- \`print(product)\` ↓ \`__str__()\`",
              "- \`repr(product)\` ↓ \`__repr__()\`",
              "- \`product1 == product2\` ↓ \`__eq__()\`",
              "- \`len(cart)\` ↓ \`__len__()\`",
              "Your objects feel more like Python's built-in objects because they participate in the same data model."
            ]
          },
          {
            kind: "takeaways",
            items: [
              "Special methods connect your classes to Python's built-in syntax and operations.",
              "**Dunder** means double underscore, as in \`__str__()\` and \`__len__()\`.",
              "\`__str__()\` creates a readable representation of an object.",
              "\`__repr__()\` creates a developer-oriented representation.",
              "\`__len__()\` lets objects work with \`len()\`, and \`__eq__()\` defines equality between objects.",
              "\`__add__()\` and related methods support operator overloading.",
              "\`__call__()\` lets an object behave like a callable (like a function).",
              "Implement special methods when they give your class natural Python behavior."
            ]
          },
          {
            kind: "quiz",
            questions: [
              {
                id: "q1",
                question: "Which method lets `len(object)` work?",
                options: [
                  "__len__()",
                  "__size__()",
                  "__count__()",
                  "__length__()"
                ],
                correctIndex: 0,
                explanation: "Python's `len()` function automatically delegates to the `__len__()` special method."
              },
              {
                id: "q2",
                question: "What is the main difference between `__str__()` and `__repr__()`?",
                options: [
                  "`__str__()` is usually readable for users, while `__repr__()` is useful for developers and debugging.",
                  "`__str__()` is for developers, while `__repr__()` is for users.",
                  "`__str__()` returns a string, while `__repr__()` returns a byte array.",
                  "`__str__()` handles string operations, while `__repr__()` handles representations of numbers."
                ],
                correctIndex: 0,
                explanation: "`__str__()` provides a readable representation (used by `print()`), whereas `__repr__()` provides a detailed, unambiguous representation meant for developers."
              },
              {
                id: "q3",
                question: "Which method can define the behavior of `object1 + object2`?",
                options: [
                  "__add__()",
                  "__plus__()",
                  "__sum__()",
                  "__append__()"
                ],
                correctIndex: 0,
                explanation: "The `+` operator maps directly to the `__add__()` dunder method."
              }
            ]
          }
        ]
      }

    ]
  }
};
