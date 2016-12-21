using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
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

            DateTime date = message.Date;
            string name = message.Name;
            int number = message.Number;
            string token = message.TOKEN;

            if (token != null && System.Configuration.ConfigurationManager.AppSettings["token"] == token)
            {
                Response response = new Response
                {
                    Hello_Name = "Hello " + message.Name,
                    Date_Utc_Now = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    Two_Squared_Number = Convert.ToInt32(Math.Pow(number, 2))
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
            DateTime date = default(DateTime);
            int number = 0;

            string payloadContent = System.Text.UTF8Encoding.Default.GetString(parameters);

            Dictionary<string, string> PayloadParameters = JsonConvert.DeserializeObject<Dictionary<string, string>>(payloadContent);


            if (PayloadParameters.ContainsKey("TOKEN") && System.Configuration.ConfigurationManager.AppSettings["token"] == PayloadParameters["TOKEN"])
            {
                if (PayloadParameters.ContainsKey("NAME"))
                {
                   name  = PayloadParameters["NAME"];
                }
                if (PayloadParameters.ContainsKey("DATE"))
                {
                    date = Convert.ToDateTime(PayloadParameters["DATE"]);
                }
                if (PayloadParameters.ContainsKey("NUMBER"))
                {
                    number = Convert.ToInt32(PayloadParameters["NUMBER"]);
                }

                Response response = new Response
                {
                    Hello_Name = "Hello " + name,
                    Date_Utc_Now = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    Two_Squared_Number = Convert.ToInt32(Math.Pow(number, 2))

                };

                //return Ok(response);
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
