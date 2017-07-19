using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebhookTest.Api.Models
{
    public class Person
    {
        public string Name { get; set; }
        public int Age { get; set; }
        public Address Adress { get; set; }
    }
}