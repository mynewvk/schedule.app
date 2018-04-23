const cheerio = require('cheerio');
const request = require('request');
const {ipcMain} = require('electron');

Parser = function(inst, group, semestr, part){
	this.timetable = [];
	this.timetableTemp = [];
	this.$;
	this.link = 'http://www.lp.edu.ua/rozklad-dlya-studentiv?inst=9&group=10534&semestr=0&semest_part=1';

	this.url = "http://www.lp.edu.ua/rozklad-dlya-studentiv";
	this.inst = inst || null;
	this.group =  group || null;
	this.semestr = semestr || 1;
	this.semestrPart = part || 1;

	this.parse = function(){
		//let link = this.buildLink();

		request(this.link, (err, resp, body) => {
			if(err) throw err;

			this.$ = cheerio.load(body, {decodeEntities: true});
			this.parseDays();
			this.setInitialData();

			//timetable[i][j] - Пара
			for(var i = 0; i < this.timetable.length; i++){
				for(j = 0; j < this.timetable[i].length; j++){
					//Заповнює поле "when" для кожної пари.
					this.setWhen(i, j);
					//Чи є чесельник і знаменник чи ні.
					var numeratorDenomirator = cheerio.load(this.timetable[i][j])('td[colspan=2] tr').length;
					//Якщо э і чисельний і знаменник
					if( numeratorDenomirator == 2 ){
						
						//ЧИСЕЛЬНИК
						var howGroupInNumerator = cheerio.load(this.timetable[i][j])('td[colspan=2] tr')
							.first()
							.find("td")
							.length;
						//В чисельнику 2 групи
						if( howGroupInNumerator == 2 ){
							
							//
							//Заповнюю першу підгрупу чисельника
							//
							this.timetableTemp[i][j]['num'].first = {};

							this.timetableTemp[i][j]['num'].first.name = cheerio.load(this.timetable[i][j])('.maincell')
								.find('tr').first()
								.find('td').first()
								.find('b').text();

							this.timetableTemp[i][j]['num'].first.who = cheerio.load(this.timetable[i][j])('.maincell')
								.find('tr').first()
								.find('td').first()
								.find('i').text();

							//Фільтр
							var where = this.whereFilter(
								this.timetableTemp[i][j]['num'].first.name,
								this.timetableTemp[i][j]['num'].first.who,
								cheerio.load(this.timetable[i][j])('tr').first().find('td').first().text()
							);
							//Вставка значення фільтра
							this.timetableTemp[i][j]['num'].first.where = where;

							//
							//Заповнюю другу підгрупу чисельника
							//
							this.timetableTemp[i][j]['num'].second = {}

							this.timetableTemp[i][j]['num'].second.name = cheerio.load(this.timetable[i][j])('.maincell')
								.find('tbody').find('tr')
								.first().find('td').last().find('b').text();

							this.timetableTemp[i][j]['num'].second.who = cheerio.load(this.timetable[i][j])('tr')
								.first().find('td')
								.last().find('i').text();
							
							//Фільтр
							where = this.whereFilter(
								this.timetableTemp[i][j]['num'].second.name,
								this.timetableTemp[i][j]['num'].second.who,
								cheerio.load(this.timetable[i][j])('tr').first().find('td').last().text()
								);
							//Вставка значення фільтра
							this.timetableTemp[i][j]['num'].second.where = where;
						//
						//Якщо одна група у чисельнику
						//
						}else if( howGroupInNumerator == 1 ){
							
							this.timetableTemp[i][j]['num'].together = {}

							this.timetableTemp[i][j]['num'].together.name = cheerio.load(this.timetable[i][j])('tr')
								.first().find('td')
								.find('b').text();

							this.timetableTemp[i][j]['num'].together.who = cheerio.load(this.timetable[i][j])('tr')
								.first().find('td')
								.find('i').text();

							//Фільтр
							var where = this.whereFilter(
								this.timetableTemp[i][j]['num'].together.name,
								this.timetableTemp[i][j]['num'].together.who,
								cheerio.load(this.timetable[i][j])('tr').first().find("td").text()
								);
							//Вставка значення фільтра
							this.timetableTemp[i][j]['num'].together.where = where;

						}
						//
						// ЗНАМЕННИК 
						//
						var GroupInDenominator = cheerio.load(this.timetable[i][j])('td[colspan=2]').find('tr').last().find("td").length;
						//
						//Якшо дві групи у знаменнику
						//
						if(GroupInDenominator == 2){
								//
								//Заповнюю першу підгрупу знаменника
								//
								this.timetableTemp[i][j]['dem'].first = {};

								this.timetableTemp[i][j]['dem'].first.name = cheerio.load(this.timetable[i][j])('tr')
									.last().find('td')
									.first().find('b').text();

								this.timetableTemp[i][j]['dem'].first.who = cheerio.load(this.timetable[i][j])('tr')
									.last().find('td')
									.first().find('i').text();
								
								//Фільтр
								where = this.whereFilter(
									this.timetableTemp[i][j]['dem'].first.name,
									this.timetableTemp[i][j]['dem'].first.who,
									cheerio.load(this.timetable[i][j])('tr').last().find('td').first().text()
								);
								//Вставка значення фільтра
								this.timetableTemp[i][j]['dem'].first.where = where;

								//
								//Заповнюю другу підгрупу знаменника
								//
								this.timetableTemp[i][j]['dem'].second = {};

								this.timetableTemp[i][j]['dem'].second.name = cheerio.load(this.timetable[i][j])('tr')
									.last().find('td')
									.last().find('b').text();

								this.timetableTemp[i][j]['dem'].second.who = cheerio.load(this.timetable[i][j])('tr')
									.last().find('td')
									.last().find('i').text();

								//Фільтр
								where = this.whereFilter(
									this.timetableTemp[i][j]['dem'].second.name,
									this.timetableTemp[i][j]['dem'].second.who,
									cheerio.load(this.timetable[i][j])('tr').last().find('td').last().text()
								);

								//Вставка значення фільтра
								this.timetableTemp[i][j]['dem'].second.where = where;

							//
							//якшо одна група у знаменнику
							//
						}else if(GroupInDenominator == 1){
							//
							//Заповнюю cпільну пару знаменника
							//
							this.timetableTemp[i][j]['dem'].together = {};

							this.timetableTemp[i][j]['dem'].together.name = cheerio.load(this.timetable[i][j])('tr')
								.last().find('td')
								.find('b').text();

							this.timetableTemp[i][j]['dem'].together.who = cheerio.load(this.timetable[i][j])('tr')
								.last().find('td')
								.find('i').text();
							
							//Фільтр
							where = this.whereFilter(
								this.timetableTemp[i][j]['dem'].together.name,
								this.timetableTemp[i][j]['dem'].together.who,
								cheerio.load(this.timetable[i][j])('tr').last().find("td").text()
							);

							//Вставка значення фільтра
							this.timetableTemp[i][j]['dem'].together.where = where;
						}

					} else {

		    			var groupTogether = cheerio.load(this.timetable[i][j])('td[colspan=2] tr').find("td").length;
		    			//Якщо дві групи
		    			if(groupTogether == 2){
		    				//
		    				// Перша підгрупа
		    				//
		    				this.timetableTemp[i][j]['together'].first = {};

		    				this.timetableTemp[i][j]['together'].first.name = cheerio.load(this.timetable[i][j])('tr')
		    					.find('td').first()
		    					.find('b').text();
		    				this.timetableTemp[i][j]['together'].first.who = cheerio.load(this.timetable[i][j])('tr')
		    					.find('td').first()
		    					.find('i').text();

		    				//Фільтр
		    				var where = this.whereFilter(
		    					this.timetableTemp[i][j]['together'].first.name,
		    					this.timetableTemp[i][j]['together'].first.who,
		    					cheerio.load(this.timetable[i][j])('tr').find('td').first().text()
		    				);

		    				//Вставка значення фільтра
		    				this.timetableTemp[i][j]['together'].first.where = where;

		    				//
		    				// Друга підгрупа
		    				//

		    				this.timetableTemp[i][j]['together'].second = {}

		    				this.timetableTemp[i][j]['together'].second.name = cheerio.load(this.timetable[i][j])('tr')
		    					.find('td').last()
		    					.find('b').text();

		    				this.timetableTemp[i][j]['together'].second.who = cheerio.load(this.timetable[i][j])('tr')
		    					.find('td').last()
		    					.find('i').text();

		    				//Фільтр
		    				where = this.whereFilter(
		    					this.timetableTemp[i][j]['together'].second.name,
		    					this.timetableTemp[i][j]['together'].second.who,
		    					cheerio.load(this.timetable[i][j])('tr').find('td').last().text()
		    				);

		    				//Вставка значення фільтра
		    				this.timetableTemp[i][j]['together'].second.where = where;

		    			//
		    			//Якщо одна група
		    			//
		    			}else if(groupTogether == 1){

		    				this.timetableTemp[i][j]['together'].together = {};

		    				this.timetableTemp[i][j]['together'].together.name = cheerio.load(this.timetable[i][j])('b').text();
		    				this.timetableTemp[i][j]['together'].together.who = cheerio.load(this.timetable[i][j])('i').text();

		    				//Фільтр
		    				var where = this.whereFilter(
		    					cheerio.load(this.timetable[i][j])('b').text(),
		    					cheerio.load(this.timetable[i][j])('i').text(),
		    					cheerio.load(this.timetable[i][j])('.color').text()
		    				);

		    				// кінець фільтра
		    				this.timetableTemp[i][j]['together'].together.where = where;
		    			}
	    			}
				}
			}
			ipcMain.on('message1', (event, data) => {
				event.sender.send('message', JSON.stringify(this.timetableTemp));	
			})
		});
	}
	this.buildLink = function(){
		this.link = this.url + "?"
			+"inst="+this.inst
		    +"&group="+this.group
			+"&semestr="+this.semestr
			+"&semest_part="+this.semestrPart

		return this.link
	}
	this.parseDays = function(){
		var tr = this.$('table.outer').children('tbody').children('tr');
		var state = 0;
		var i = -1;
		tr.each((iter, el) => {

			var el = this.$(el)

			if(el.attr('style')){
				if( el.children('td').length > 1 ){
					i++;
					if(state == 1){
						state = 0;
					}else{
						this.timetableTemp[i] = [];
						this.timetableTemp[i]['when'] = el.children('td.leftcell').first().text();
					}
				}else{
					this.timetableTemp[i+1] = [];
					this.timetableTemp[i+1]['when'] = el.children('td.leftcell').first().text();
					state = 1;
				}
			}

			if(i != -1){
				if( el.children('td').length > 1 ){
					if(!this.timetable[i]) this.timetable[i] = [];
					this.timetable[i].push("<table>" + el.html() + "</table>");
				}
			}
		});
	}
	this.setWhen = function(i, j){
		this.timetableTemp[i][j]['when'] = cheerio.load(this.timetable[i][j])('.leftcell').last().text();
	}
	this.setInitialData = function(){
		for(var i = 0; i < this.timetable.length; i++){
			this.timetableTemp[i] = [];
			for(var j = 0; j < this.timetable[i].length; j++){
				this.timetableTemp[i][j] = {};
				this.timetableTemp[i][j].num = {};
				this.timetableTemp[i][j].dem = {};
				this.timetableTemp[i][j].together = {};
			}
		}
	}
	this.whereFilter = function(name, who, text){
		let where = '';
		where = text.replace(name, '');
		where = where.replace(who, '');
		where = where.replace(/\n/g, '');
		where = where.replace(/\r/g, '');
		return where;
	}
}

exports.Parser = Parser;