# Program to count the number and sum of all items in a list

items = [1,2,3,4,5,6]               # Taken a list
total = 0                           # Initialize 'total' as 0
count = 0                           # Initialize 'count' as 0

for i in range(len(items)):         # Loop through all items
    count += 1                      # Increase counter by 1
    total += items[i]               # Add items into 'total'

print("Sum of all items: ", total)  # Print total
print("Count of items: ", count)    # Print total




