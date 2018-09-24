/* TODO: these classes are global for now because the file is used in
both the client and server, and browser's don't necessarily support require.
I can probably fix this with a build process later on that compiles client files
at build time.
*/

Inventory = (items, socket, server) => {
  const self = {
    // TODO: seems like items would make more sense as an object, so that
    // I dont have to loop through it for add / remove / find operations
    // could test with Dev Tools profiling!
    // like Player.list and Item.list, Bullet.list, etc.
    items: items, // { id: 'itemId', amount: 1 }
    socket: socket,
    server: server,
  }
  self.addItem = (id, amount) => {
		for (let i = 0 ; i < self.items.length; i++) {
			if (self.items[i].id === id) {
				self.items[i].amount += amount;
				self.refreshRender();
				return;
			}
		}
		self.items.push({ id: id, amount: amount });
		self.refreshRender();
  }
  self.removeItem = (id, amount) => {
		for (let i = 0 ; i < self.items.length; i++) {
			if(self.items[i].id === id){
				self.items[i].amount -= amount;
				if(self.items[i].amount <= 0)
        self.items.splice(i,1);
				self.refreshRender();
				return;
			}
		}
  }
  self.hasItem = (id, amount) => {
		for (let i = 0 ; i < self.items.length; i++) {
			if(self.items[i].id === id){
				return self.items[i].amount >= amount;
			}
		}
		return false;
  }
	self.refreshRender = () => {

    // in server
		if (self.server) {
			self.socket.emit('updateInventory', self.items);
			return;
		}

    // otherwise in client
    // TODO: This is not separating concerns. should use string literals at least
    const inventory = document.getElementById('inventory');
    inventory.innerHTML = '';
    const addButton = data => {
      let item = Item.list[data.id];
      let button = document.createElement('button');
      button.onclick = () => {
        // Item.list[item.id].event();
        self.socket.emit('useItem', item.id);
      }
      button.innerText = `${item.name} x ${data.amount}`;
      inventory.appendChild(button);
    };
		// let str = "";
		for (let i = 0 ; i < self.items.length; i++) {
      addButton(self.items[i]);
			// let item = Item.list[self.items[i].id];
			// let onclick = "Item.list['" + item.id + "'].event()";
			// str += "<button onclick=\"" + onclick + "\">" + item.name + " x" + self.items[i].amount + "</button><br>";
		}
		// document.getElementById("inventory").innerHTML = str;
  }

  if (self.server) {
    socket.on('useItem', itemId => {
      if (!self.hasItem(itemId, 1)) {
        console.log('Potential cheater');
        return;
      }

      let item = Item.list[itemId];
      item.event(Player.list[self.socket.id]);
    });
  }

	return self;
}

Item = (id, name, event) => {
	const self = {
		id:id,
		name:name,
		event:event,
	}
	Item.list[self.id] = self;
	return self;
}
Item.list = {};

Item('potion','Potion', player => {
	player.hp = 10;
  player.inventory.removeItem('potion', 1);
  player.inventory.addItem('superAttack', 1);
});

Item('superAttack','Super Attack', player => {
	for (let i = 0; i < 360; i++) {
    player.shootBullet(i);
    // remove item
  }
});
