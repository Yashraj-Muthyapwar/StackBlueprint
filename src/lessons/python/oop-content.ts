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
            code: `class Product:\n    def __init__(self, name, price):\n        self.name = name\n        self.price = price\n\n    def display_details(self):\n        print(f"{self.name}: \\${self.price}")\n\nlaptop = Product("Laptop", 899)\nheadphones = Product("Headphones", 120)\n\nlaptop.display_details()\nheadphones.display_details()`
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
          }
        ]
      },
      {
        slug: "instance-and-class-attributes",
        title: "Instance and Class Attributes",
        subtitle: "Coming soon",
        sections: []
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
