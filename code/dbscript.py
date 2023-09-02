import json
import pymysql

# Load data from JSON
with open('collaborative_product_offer_platform/code/stores.json', 'r') as file:
    full_data = json.load(file)

# Extract elements from the data
elements = full_data.get('elements', [])

# Establish the connection to MySQL
connection = pymysql.connect(
    host='localhost',
    user='root',  
    password='felios123',  
    db='web'
)

cursor = connection.cursor()

# Loop through the elements list
for element in elements:
    tags = element.get('tags', {})
    if 'name' in tags:
        store_id = element.get('id')
        name = tags.get('name')
        lon = element.get('lon')
        lat = element.get('lat')
        
        sql = """
            INSERT INTO store (store_id, name, lon, lat)
            VALUES (%s, %s, %s, %s);
        """
        
        cursor.execute(sql, (store_id, name, lon, lat))

# Commit the transaction and close the connection
connection.commit()
cursor.close()
connection.close()
