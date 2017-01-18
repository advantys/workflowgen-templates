using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Web;
using System.Web.Http;
using WebhookTest.Api.Models;

namespace WebhookTest.Api.Controllers
{
    public class WebhookController : ApiController
    {

        // GET: api/Webhook
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET: api/Webhook/5
        public string Get(int id)
        {
            return "value";
        }

        // POST: api/Webhook
        [HttpPost]
        public IHttpActionResult Post([FromBody]Message message)
        {
            //    if (some validation)
            //        return BadRequest();
            string name = message.Person.Name;
            int age = message.Person.Age;
            string street = message.Person.Adress.Street;
            string zipcode = message.Person.Adress.Zipcode;

            string token = message.TOKEN;

            if (token != null && System.Configuration.ConfigurationManager.AppSettings["token"] == token)
            {

                Person p1 = new Person();
                p1.Name = "John";
                p1.Age = 30;
                Address p1Adress = new Address();
                p1Adress.Zipcode = "XXX XXX";
                p1Adress.Street = "Test Street";

                p1.Adress = p1Adress;
             
                Response response = new Response
                {
                    Person = p1,
                };

                return Ok(response);
            }
            else
                return Unauthorized();
        }

       // POST: api/Webhook
       [HttpPost]

        public IHttpActionResult PostWithPayload([FromBody] PayloadObject message)
        {
            //if (some validation)
            //    return BadRequest();

            byte[] parameters = null;
            parameters = HttpUtility.UrlDecodeToBytes(message.Payload);
            string name = null;
            int age = 0; 
            string street = null;
            string zipcode = null;
            Address adress = new Address();

            string payloadContent = System.Text.UTF8Encoding.Default.GetString(parameters);

            Dictionary<string, dynamic> PayloadParameters = JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(payloadContent);

            if (PayloadParameters.ContainsKey("TOKEN") && System.Configuration.ConfigurationManager.AppSettings["token"] == PayloadParameters["TOKEN"])
            {
                if (PayloadParameters.ContainsKey("Person"))
                {
                    string personCode = JsonConvert.SerializeObject(PayloadParameters["Person"]);

                    JObject personJsonObject = JObject.Parse(personCode);
                    JToken person = personJsonObject;
                    name = (string)person["Name"];
                    age = (Int32)person["Age"];

                    string adressCode = JsonConvert.SerializeObject(person["Adress"]);
                    JObject personAdress = JObject.Parse(adressCode);
                    zipcode = (string)personAdress["Zipcode"];
                    street = (string)personAdress["Street"];
                }
               
                Person p1 = new Person();
                p1.Name = "Jane Doe";
                p1.Age = 30;
                Address p1Adress = new Address();
                p1Adress.Zipcode = "H1K";
                p1Adress.Street = "Saint Donat";

                p1.Adress = p1Adress;

                Response response = new Response
                {
                    Person = p1,
                };

                return Ok(response);
            }
            else
                return Unauthorized();
        }

        // PUT: api/Webhook/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/Webhook/5
        public void Delete(int id)
        {
        }
    }
}
