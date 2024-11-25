CREATE DATABASE AGRICONNECT;
USE AGRICONNECT;
CREATE TABLE farmers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
CREATE TABLE buyers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contactno varchar(10) NOT NULL UNIQUE,
    address varchar(50) not null,
    password VARCHAR(255) NOT NULL
);
CREATE TABLE Crops (
    CropID INT AUTO_INCREMENT PRIMARY KEY,
    FarmerID INT NOT NULL,
    CropName VARCHAR(100) NOT NULL,
    Description TEXT,
    QuantityAvailable INT NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    Address VARCHAR(80) NOT NULL,
        FarmerName VARCHAR(100),
    ContactInfo VARCHAR(100),
    FLocation VARCHAR(100),
    FOREIGN KEY (FarmerID) REFERENCES Farmers(id) ON DELETE CASCADE
);
CREATE TABLE orders (
    OrderID INT AUTO_INCREMENT PRIMARY KEY,
    CropID INT,
    TotalPrice DECIMAL(10, 2),
    FOREIGN KEY (CropID) REFERENCES crops(CropID) on delete cascade,
    vendorid int ,
     FOREIGN KEY (vendorid) REFERENCES buyers(id) on DELETE CASCADE
);
CREATE TABLE Transactions (
    TransactionID varchar(20) primary key,
    PaymentMethod VARCHAR(50),
    TransactionDate date,
    OId int,
	FOREIGN KEY (OId) REFERENCES orders(OrderID) ON DELETE CASCADE
    );
    CREATE TABLE AdminLogin (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Password VARCHAR(255) NOT NULL
);