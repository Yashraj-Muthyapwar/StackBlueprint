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
            code: "class Writer:\n    def write(self):\n        print(\"Writing content.\")\n\nclass Speaker:\n    def speak(self):\n        print(\"Speaking to an audience.\")\n\nclass Presenter(Writer, Speaker):\n    pass\n\npresenter = Presenter()\npresenter.write()\npresenter.speak()\n\n# Inspect the Method Resolution Order (MRO)\nprint(Presenter.mro())"
          },
          {
            kind: "prose",
            body: [
              "Now `Presenter` inherits methods from both parent classes.",
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
