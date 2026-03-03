-- ============================================================
-- Nehrem Household Products Store - Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS nehrem_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nehrem_store;

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
CREATE TABLE categories (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
CREATE TABLE products (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(255)   NOT NULL,
    description    TEXT,
    price          DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2) DEFAULT NULL,
    stock_quantity INT            NOT NULL DEFAULT 0,
    image_url      VARCHAR(500)   DEFAULT NULL,
    category_id    BIGINT,
    active         BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id)
        REFERENCES categories (id) ON DELETE SET NULL
);

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE orders (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name      VARCHAR(100)   NOT NULL,
    last_name       VARCHAR(100)   NOT NULL,
    phone           VARCHAR(20)    NOT NULL,
    delivery_method ENUM('DELIVERY', 'PICKUP') NOT NULL DEFAULT 'DELIVERY',
    address         VARCHAR(500)   DEFAULT NULL,
    total_amount    DECIMAL(12, 2) NOT NULL,
    status          ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED')
                                   NOT NULL DEFAULT 'PENDING',
    notes           TEXT,
    created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE order_items (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id   BIGINT         NOT NULL,
    product_id BIGINT         NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity   INT            NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal   DECIMAL(12, 2) NOT NULL,
    CONSTRAINT fk_item_order   FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- ============================================================
-- SEED DATA - Default Categories
-- ============================================================
INSERT INTO categories (name, description) VALUES
('Kitchen',        'Kitchen utensils, cookware, and appliances'),
('Cleaning',       'Cleaning supplies and household cleaning products'),
('Bathroom',       'Bathroom accessories and hygiene products'),
('Living Room',    'Furniture and decor for the living room'),
('Bedroom',        'Bedding, pillows, and bedroom accessories'),
('Storage',        'Storage boxes, shelves, and organizers'),
('Garden',         'Garden tools and outdoor accessories'),
('Baby & Kids',    'Products for babies and children');
